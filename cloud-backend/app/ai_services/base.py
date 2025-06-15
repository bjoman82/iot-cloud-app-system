from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIService(ABC):
    def __init__(self, config: Any):
        self.model = getattr(config, "model", "")
        self.temperature = getattr(config, "temperature", 0.7)
        self.max_tokens = getattr(config, "max_tokens", 500)
        self.system_prompt = getattr(config, "system_prompt", "")

    @abstractmethod
    async def generate_response(self, prompt: str, context: str = "", max_tokens: int = None) -> str:
        """Generate a response from the AI model."""
        pass

    @abstractmethod
    async def generate_conversation(self, topic: str, roles: Dict[str, Any], max_turns: int = 3, max_tokens: int = None) -> list:
        """Generate a conversation between multiple AI roles."""
        pass

    def format_message(self, role: str, content: str) -> Dict[str, str]:
        """Format a message with role and content."""
        return {"role": role, "content": content} 