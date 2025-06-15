from pydantic import BaseModel
from typing import Dict, Any, List
import os

class AIServiceConfig(BaseModel):
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Define available AI roles and their configurations
    AI_ROLES: Dict[str, Dict[str, Any]] = {
        "Business Analyst": {
            "name": "Business Analyst",
            "description": "Focuses on business value, ROI, and market opportunities",
            "model": "models/gemini-2.0-flash-lite",
            "temperature": 0.7,
            "max_tokens": 300,  # Default max tokens for responses
            "system_prompt": "You are a business analyst focused on identifying value, ROI, and market opportunities. Provide clear, concise insights that help stakeholders understand the business implications."
        },
        "Customer Advocate": {
            "name": "Customer Advocate",
            "description": "Represents customer needs and user experience",
            "model": "models/gemini-2.0-flash-lite",
            "temperature": 0.7,
            "max_tokens": 300,
            "system_prompt": "You are a customer advocate focused on user needs and experience. Consider how solutions impact end-users and ensure their needs are represented in the discussion."
        },
        "Technical Architect": {
            "name": "Technical Architect",
            "description": "Handles technical feasibility and implementation details",
            "model": "models/gemini-2.0-flash-lite",
            "temperature": 0.5,
            "max_tokens": 300,
            "system_prompt": "You are a technical architect focused on implementation feasibility and technical details. Provide clear technical guidance while considering practical constraints."
        }
    }

    # Default conversation settings
    DEFAULT_CONVERSATION_SETTINGS: Dict[str, Any] = {
        "max_turns": 2,
        "max_tokens_per_response": 300,
        "temperature": 0.7,
        "active_roles": ["Business Analyst", "Technical Architect"]  # Default active roles
    }

# AI Role Configurations
AI_ROLES = {
    "business": {
        "name": "Business Analyst",
        "description": "Focuses on business value, ROI, and market opportunities",
        "model": "models/gemini-2.0-flash-lite",
        "temperature": 0.7,
        "max_tokens": 300,  # Default max tokens for responses
        "system_prompt": "You are a business analyst AI. Your role is to analyze business opportunities, ROI, and market potential. Focus on practical business value and market feasibility. Keep responses concise and to the point."
    },
    "customer": {
        "name": "Customer Advocate",
        "description": "Represents customer needs and user experience",
        "model": "models/gemini-2.0-flash-lite",
        "temperature": 0.7,
        "max_tokens": 300,
        "system_prompt": "You are a customer advocate AI. Your role is to represent user needs, preferences, and experience. Focus on usability, accessibility, and customer satisfaction. Keep responses concise and to the point."
    },
    "technical": {
        "name": "Technical Architect",
        "description": "Handles technical feasibility and implementation details",
        "model": "models/-2.0-flash-lite",
        "temperature": 0.5,
        "max_tokens": 300,
        "system_prompt": "You are a technical architect AI. Your role is to evaluate technical feasibility, implementation approaches, and system architecture. Focus on technical soundness and implementation details. Keep responses concise and to the point."
    },
    "dreamer": {
        "name": "Visionary",
        "description": "Brings creative and innovative ideas to the table",
        "model": "models/gemini-1.5-pro",
        "temperature": 0.8,
        "max_tokens": 300,
        "system_prompt": "You are a visionary AI. Your role is to bring creative and innovative ideas to the table. Think outside the box and propose bold solutions. Keep responses concise and to the point."
    },
    "critic": {
        "name": "Critical Thinker",
        "description": "Challenges assumptions and identifies potential issues",
        "model": "models/gemini-1.5-pro",
        "temperature": 0.6,
        "max_tokens": 300,
        "system_prompt": "You are a critical thinker AI. Your role is to challenge assumptions and identify potential issues. Be constructive in your criticism. Keep responses concise and to the point."
    },
    "realizer": {
        "name": "Practical Implementer",
        "description": "Focuses on practical implementation and execution",
        "model": "models/gemini-1.5-pro",
        "temperature": 0.5,
        "max_tokens": 300,
        "system_prompt": "You are a practical implementer AI. Your role is to focus on practical implementation and execution. Break down ideas into actionable steps. Keep responses concise and to the point."
    }
}

# Default conversation settings
DEFAULT_CONVERSATION_SETTINGS = {
    "max_turns": 3,
    "max_tokens_per_response": 300,
    "temperature": 0.7,
    "active_roles": ["business", "technical", "customer"]  # Default active roles
} 