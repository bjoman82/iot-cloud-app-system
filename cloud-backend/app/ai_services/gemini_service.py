import google.generativeai as genai
from typing import Dict, Any, List, Optional
import asyncio
import time
import os
import json
import logging
from datetime import datetime
from .base import BaseAIService
from .config import AIServiceConfig, DEFAULT_CONVERSATION_SETTINGS

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gemini_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('GeminiService')

def load_roles() -> Dict:
    """Load roles from configuration file."""
    try:
        config_file = os.path.join(os.path.dirname(__file__), "..", "config", "roles.json")
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                return json.load(f)
        return {"roles": {}}
    except Exception as e:
        logger.error(f"Error loading roles: {e}")
        return {"roles": {}}

class GeminiService(BaseAIService):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = AIServiceConfig().GOOGLE_API_KEY
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY is required")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        
        # Get available models
        available_models = [model.name for model in genai.list_models()]
        if self.model not in available_models:
            raise ValueError(f"Model {self.model} not available. Available models: {available_models}")
        
        # Initialize the model
        self.model = genai.GenerativeModel(self.model)
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 2  # Minimum seconds between requests
        self.max_retries = 3
        self.retry_delay = 60  # Default retry delay in seconds
        
        logger.info(f"GeminiService initialized with model: {self.model}")

    async def _wait_for_rate_limit(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < self.min_request_interval:
            wait_time = self.min_request_interval - time_since_last_request
            logger.debug(f"Rate limiting: waiting {wait_time:.2f} seconds")
            await asyncio.sleep(wait_time)
        self.last_request_time = time.time()

    async def generate_response(self, 
                              prompt: str, 
                              context: List[Dict[str, str]] = None,
                              max_tokens: Optional[int] = None) -> str:
        """Generate a response using Google's Gemini model with rate limiting."""
        # Simplified logging - only show topic and output
        logger.info(f"Topic: {prompt}")

        for attempt in range(self.max_retries):
            try:
                await self._wait_for_rate_limit()
                
                # Format the conversation history if context is provided
                history = []
                if context:
                    for msg in context:
                        # Convert roles to user/model as required by Gemini
                        role = "user" if msg["role"] == "user" else "model"
                        history.append({
                            "role": role,
                            "parts": [msg["content"]]
                        })

                # Use provided max_tokens or default from config
                max_tokens = max_tokens or self.config.get("max_tokens", 300)

                # Add max_tokens instruction to the prompt
                enhanced_prompt = (
                    f"{prompt}\n\n"
                    f"IMPORTANT: Please provide a comprehensive response within {max_tokens} tokens. "
                    "Your response should:\n"
                    "1. Cover all important aspects of the topic\n"
                    "2. Stay concise and focused\n"
                    "3. Prioritize quality and relevance\n"
                    "4. Maintain clarity while being brief"
                )

                # Generate the response
                response = await self.model.generate_content_async(
                    contents=history + [{"role": "user", "parts": [enhanced_prompt]}],
                    generation_config={
                        "temperature": self.temperature,
                        "max_output_tokens": max_tokens,
                    }
                )
                
                # Simplified logging - only show output
                logger.info(f"Output: {response.text[:100]}{'...' if len(response.text) > 100 else ''}")
                return response.text
            except Exception as e:
                error_str = str(e)
                logger.error(f"Error generating response (attempt {attempt + 1}/{self.max_retries}): {error_str}")
                if "429" in error_str and "quota" in error_str.lower():
                    if attempt < self.max_retries - 1:
                        logger.warning(f"Rate limit hit, waiting {self.retry_delay} seconds before retry...")
                        await asyncio.sleep(self.retry_delay)
                        continue
                raise Exception(f"Error generating response: {error_str}")

    async def generate_conversation(self, 
                                 topic: str, 
                                 roles: Dict[str, Any], 
                                 max_turns: int = None,
                                 max_tokens: int = None,
                                 conversation_history: List[Dict[str, str]] = None) -> List[Dict[str, str]]:
        """Generate a conversation between multiple AI roles with rate limiting."""
        logger.info(f"Starting conversation about: {topic}")

        # Use provided settings or defaults
        max_turns = max_turns or DEFAULT_CONVERSATION_SETTINGS["max_turns"]
        max_tokens = max_tokens or DEFAULT_CONVERSATION_SETTINGS["max_tokens_per_response"]
        
        # Initialize conversation with history if provided
        conversation = conversation_history or []
        
        # If no history, start with the topic
        if not conversation:
            initial_prompt = (
                f"Let's discuss the following topic: {topic}\n\n"
                f"Each response should be comprehensive yet concise, staying within {max_tokens} tokens. "
                "Focus on quality and relevance while maintaining brevity."
            )
            conversation.append(self.format_message("user", initial_prompt))
            logger.info("Added initial topic prompt to conversation")
        
        # If we have a user message at the end of the history, we should only get responses from the roles
        # Otherwise, we'll do a full round of responses
        if conversation and conversation[-1]["role"] == "user" and len(conversation) > 1:
            logger.info("Processing user message with responses from all roles")
            # Only get one response from each role to the user's message
            for role_key, role_config in roles.items():
                logger.info(f"Getting response from role: {role_config['name']}")
                
                # Create a prompt that focuses on the user's message
                user_message = conversation[-1]["content"]
                prompt = (
                    f"As the {role_config['name']}, please respond to this question/statement: {user_message}\n\n"
                    f"Consider the context of our discussion about {topic} and the conversation history so far. "
                    f"Your response should be comprehensive yet concise, staying within {max_tokens} tokens. "
                    "Focus on quality and relevance while maintaining brevity."
                )
                
                # Include role's system prompt in the context
                if role_config.get('system_prompt'):
                    prompt = f"{role_config['system_prompt']}\n\n{prompt}"
                
                # Use all conversation history except the last message as context
                context = conversation[:-1] if len(conversation) > 1 else []
                response = await self.generate_response(prompt, context, max_tokens)
                conversation.append(self.format_message("model", f"[{role_config['name']}] {response}"))
                logger.info(f"Added response from {role_config['name']}")
                
                # Add a small delay between responses
                await asyncio.sleep(1)
        else:
            logger.info("Starting new round of responses")
            # Do a full round of responses
            current_turn = 0
            current_topic = topic  # Start with the original topic
            
            while current_turn < max_turns:
                logger.info(f"Starting turn {current_turn + 1}/{max_turns}")
                for role_key, role_config in roles.items():
                    logger.info(f"Getting response from role: {role_config['name']}")
                    
                    # Use the current topic (which will be the previous speaker's output)
                    prompt = (
                        f"As the {role_config['name']}, please provide your perspective on: {current_topic}\n\n"
                        f"Consider the conversation history so far. "
                        f"Your response should be comprehensive yet concise, staying within {max_tokens} tokens. "
                        "Focus on quality and relevance while maintaining brevity."
                    )
                    
                    # Include role's system prompt in the context
                    if role_config.get('system_prompt'):
                        prompt = f"{role_config['system_prompt']}\n\n{prompt}"
                    
                    response = await self.generate_response(prompt, conversation, max_tokens)
                    conversation.append(self.format_message("model", f"[{role_config['name']}] {response}"))
                    logger.info(f"Added response from {role_config['name']}")
                    
                    # Update the topic for the next speaker to be this speaker's response
                    current_topic = response
                    
                    # Add a small delay between responses
                    await asyncio.sleep(1)
                
                current_turn += 1
        
        logger.info("Conversation generation completed")
        return conversation

    async def get_role_response(self,
                              role: str,
                              topic: str,
                              context: List[Dict[str, str]],
                              max_tokens: Optional[int] = None) -> Dict[str, str]:
        """Get a response from a specific role."""
        logger.info(f"Getting response from role: {role}")
        logger.info(f"Topic: {topic[:100]}{'...' if len(topic) > 100 else ''}")

        # Load roles to get the role configuration
        roles_data = load_roles()
        role_config = None
        
        # Try to find the role by name or key
        for key, config in roles_data["roles"].items():
            if config["name"] == role or key == role:
                role_config = config
                break
        
        if not role_config:
            error_msg = f"Role {role} not found"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Create a prompt that includes the role's system prompt and context
        prompt = (
            f"As the {role_config['name']}, please provide your perspective on the topic: {topic}, "
            "considering the entire discussion so far."
        )
        
        if role_config.get('system_prompt'):
            prompt = f"{role_config['system_prompt']}\n\n{prompt}"
        
        response = await self.generate_response(prompt, context, max_tokens)
        logger.info(f"Response generated for role: {role}")
        return self.format_message("model", f"[{role_config['name']}] {response}") 