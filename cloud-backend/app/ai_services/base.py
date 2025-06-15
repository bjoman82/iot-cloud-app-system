from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIService(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = config.get("model", "")
        self.temperature = config.get("temperature", 0.7)
        self.max_tokens = config.get("max_tokens", 300)
        self.system_prompt = config.get("system_prompt", "")

    @abstractmethod
    async def generate_response(self, prompt: str, context: List[Dict[str, str]] = None) -> str:
        """Generate a response from the AI model."""
        pass

    @abstractmethod
    async def generate_conversation(self, 
                                 topic: str, 
                                 roles: List[str], 
                                 max_turns: int = None,
                                 max_tokens: int = None,
                                 user_input: str = None) -> List[Dict[str, str]]:
        """Generate a conversation between multiple AI roles."""
        pass

    def format_message(self, role: str, content: str) -> Dict[str, str]:
        """Format a message with role and content."""
        return {"role": role, "content": content} 