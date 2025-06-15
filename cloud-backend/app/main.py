from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .ai_services.gemini_service import GeminiService
from .ai_services.config import AIServiceConfig

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = GeminiService(AIServiceConfig().AI_ROLES["Business Analyst"])

class ConversationRequest(BaseModel):
    topic: str
    max_turns: int
    max_tokens: int
    roles: List[str]

class TestRoleRequest(BaseModel):
    role: str
    question: str
    max_tokens: Optional[int] = None

class Message(BaseModel):
    role: str
    content: str

@app.post("/api/conversation")
async def start_conversation(request: ConversationRequest):
    try:
        messages = await ai_service.generate_conversation(
            topic=request.topic,
            roles=request.roles,
            max_turns=request.max_turns,
            max_tokens=request.max_tokens
        )
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-role")
async def test_role(request: TestRoleRequest):
    try:
        # Get the role configuration
        role_config = AIServiceConfig().AI_ROLES.get(request.role)
        if not role_config:
            raise HTTPException(status_code=404, detail=f"Role {request.role} not found")
        
        # Create a new service instance with the role's configuration
        role_service = GeminiService(role_config)
        
        # Create a context that includes the role's description
        context = [{
            "role": "user",
            "content": f"You are acting as a {request.role}. {role_config.get('description', '')}"
        }]
        
        # Generate response with max_tokens and context
        response = await role_service.generate_response(
            prompt=request.question,
            context=context,
            max_tokens=request.max_tokens or role_config.get("max_tokens", 300)
        )
        return {"message": {"role": request.role, "content": response}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roles")
async def get_roles():
    return {"roles": list(AIServiceConfig().AI_ROLES.keys())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 