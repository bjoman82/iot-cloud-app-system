import google.generativeai as genai
from typing import Dict, Any, List, Optional
import asyncio
import time
from .base import BaseAIService
from .config import AIServiceConfig, DEFAULT_CONVERSATION_SETTINGS

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

    async def _wait_for_rate_limit(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < self.min_request_interval:
            await asyncio.sleep(self.min_request_interval - time_since_last_request)
        self.last_request_time = time.time()

    async def generate_response(self, 
                              prompt: str, 
                              context: List[Dict[str, str]] = None,
                              max_tokens: Optional[int] = None) -> str:
        """Generate a response using Google's Gemini model with rate limiting."""
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
                
                return response.text
            except Exception as e:
                error_str = str(e)
                if "429" in error_str and "quota" in error_str.lower():
                    if attempt < self.max_retries - 1:
                        print(f"Rate limit hit, waiting {self.retry_delay} seconds before retry...")
                        await asyncio.sleep(self.retry_delay)
                        continue
                raise Exception(f"Error generating response: {error_str}")

    async def generate_conversation(self, 
                                 topic: str, 
                                 roles: List[str], 
                                 max_turns: int = None,
                                 max_tokens: int = None,
                                 user_input: Optional[str] = None) -> List[Dict[str, str]]:
        """Generate a conversation between multiple AI roles with rate limiting."""
        # Use provided settings or defaults
        max_turns = max_turns or DEFAULT_CONVERSATION_SETTINGS["max_turns"]
        max_tokens = max_tokens or DEFAULT_CONVERSATION_SETTINGS["max_tokens_per_response"]
        
        conversation = []
        current_turn = 0
        
        # Initialize the conversation with a user message
        initial_prompt = (
            f"Let's discuss the following topic: {topic}\n\n"
            f"Each response should be comprehensive yet concise, staying within {max_tokens} tokens. "
            "Focus on quality and relevance while maintaining brevity."
        )
        conversation.append(self.format_message("user", initial_prompt))
        
        # If user provided input, add it to the conversation
        if user_input:
            conversation.append(self.format_message("user", user_input))
        
        while current_turn < max_turns:
            for role in roles:
                # Create a prompt that includes the conversation history
                context = conversation[-2:] if len(conversation) > 2 else conversation
                prompt = (
                    f"As the {role}, please provide your perspective on the topic, considering the previous discussion. "
                    f"Your response should be comprehensive yet concise, staying within {max_tokens} tokens. "
                    "Focus on quality and relevance while maintaining brevity."
                )
                
                response = await self.generate_response(prompt, context, max_tokens)
                conversation.append(self.format_message("model", f"[{role.upper()}] {response}"))
                
                # Add a small delay between responses
                await asyncio.sleep(1)
            
            current_turn += 1
        
        return conversation

    async def get_role_response(self,
                              role: str,
                              topic: str,
                              context: List[Dict[str, str]],
                              max_tokens: Optional[int] = None) -> Dict[str, str]:
        """Get a response from a specific role."""
        prompt = f"As the {role}, please provide your perspective on the topic: {topic}, considering the previous discussion."
        response = await self.generate_response(prompt, context, max_tokens)
        return self.format_message("model", f"[{role.upper()}] {response}") 