import os
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .ai_services.gemini_service import GeminiService
from .ai_services.config import AIServiceConfig

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini service with default config
config = AIServiceConfig()
gemini_service = GeminiService(config)

# Configuration file path
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config", "roles.json")

def load_roles() -> Dict:
    """Load roles from configuration file."""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        return {"roles": {}}
    except Exception as e:
        print(f"Error loading roles: {e}")
        return {"roles": {}}

def save_roles(roles: Dict) -> None:
    """Save roles to configuration file."""
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(roles, f, indent=2)
    except Exception as e:
        print(f"Error saving roles: {e}")
        raise HTTPException(status_code=500, detail="Failed to save roles")

class RoleConfig(BaseModel):
    name: str
    description: str
    model: str
    temperature: float
    max_tokens: int
    system_prompt: Optional[str] = None
    original_name: Optional[str] = None

class ConversationRequest(BaseModel):
    topic: str
    max_turns: int
    max_tokens: int
    active_roles: List[str]
    conversation_history: Optional[List[Dict[str, str]]] = None
    next_speaker: Optional[str] = None
    user_input: Optional[str] = None

class TestRoleRequest(BaseModel):
    role_name: str
    question: str
    max_tokens: Optional[int] = None

@app.get("/api/roles")
async def get_roles():
    """Get all available roles."""
    try:
        roles_data = load_roles()
        # Convert the roles dictionary to a list of role objects
        roles_list = list(roles_data["roles"].values())
        return {"roles": roles_list}
    except Exception as e:
        print(f"Error getting roles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get roles: {str(e)}")

@app.post("/api/roles/add")
async def add_role(role: RoleConfig):
    """Add a new role."""
    roles_data = load_roles()
    if role.name in roles_data["roles"]:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    roles_data["roles"][role.name] = role.dict()
    save_roles(roles_data)
    return {"message": "Role added successfully"}

@app.post("/api/roles/update")
async def update_role(role: RoleConfig):
    """Update an existing role."""
    try:
        roles_data = load_roles()
        
        # If we have an original name, use it to find the role
        if role.original_name:
            # Convert display name to key format (e.g., "Customer Advocate" -> "customer_advocate")
            original_key = role.original_name.lower().replace(" ", "_")
            if original_key not in roles_data["roles"]:
                raise HTTPException(status_code=404, detail=f"Role '{role.original_name}' not found")
            
            # If the name has changed, we need to delete the old entry
            if role.original_name != role.name:
                del roles_data["roles"][original_key]
        else:
            # Try to find the role by name
            found = False
            for key, existing_role in roles_data["roles"].items():
                if existing_role["name"] == role.name:
                    found = True
                    break
            
            if not found:
                raise HTTPException(status_code=404, detail=f"Role '{role.name}' not found")
        
        # Convert new name to key format
        new_key = role.name.lower().replace(" ", "_")
        
        # Add/update the role with the new key
        roles_data["roles"][new_key] = role.dict(exclude={'original_name'})
        save_roles(roles_data)
        return {"message": "Role updated successfully"}
    except Exception as e:
        print(f"Error updating role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")

@app.post("/api/roles/delete")
async def delete_role(role_name: str):
    """Delete a role."""
    roles_data = load_roles()
    if role_name not in roles_data["roles"]:
        raise HTTPException(status_code=404, detail="Role not found")
    
    del roles_data["roles"][role_name]
    save_roles(roles_data)
    return {"message": "Role deleted successfully"}

@app.post("/api/ai/conversation")
async def start_conversation(request: ConversationRequest):
    """Start a new conversation with multiple AI roles."""
    try:
        roles_data = load_roles()
        active_roles = {}
        
        for role_name in request.active_roles:
            # Try to find the role by display name first
            role_found = False
            for key, role in roles_data["roles"].items():
                if role["name"] == role_name:
                    active_roles[key] = role
                    role_found = True
                    break
            
            # If not found by display name, try the underscore key
            if not role_found:
                role_key = role_name.lower().replace(" ", "_")
                if role_key not in roles_data["roles"]:
                    raise HTTPException(status_code=404, detail=f"Role {role_name} not found")
                active_roles[role_key] = roles_data["roles"][role_key]
        
        if not active_roles:
            raise HTTPException(status_code=400, detail="No active roles specified")
        
        # If we have a next speaker specified, only that role should respond
        if request.next_speaker:
            # Find the role by name or key
            next_speaker_found = False
            for key, role in active_roles.items():
                if role["name"] == request.next_speaker or key == request.next_speaker:
                    next_speaker_found = True
                    break
            
            if not next_speaker_found:
                raise HTTPException(status_code=404, detail=f"Next speaker {request.next_speaker} not found in active roles")
            
            # Get response from the specified role
            response = await gemini_service.get_role_response(
                role=request.next_speaker,
                topic=request.topic,
                context=request.conversation_history or [],
                max_tokens=request.max_tokens
            )
            return {"conversation": [response]}
        
        # If we have user input, add it to the conversation
        if request.user_input:
            conversation = request.conversation_history or []
            conversation.append({"role": "user", "content": request.user_input})
            print(f"request.user_input: {request.user_input}")
            request.topic = request.user_input
        else:
            conversation = []
        
        # Generate full conversation
        full_conversation = await gemini_service.generate_conversation(
            topic=request.topic,
            roles=active_roles,
            max_turns=request.max_turns,
            max_tokens=request.max_tokens,
            conversation_history=conversation
        )
        return {"conversation": full_conversation}
    except Exception as e:
        print(f"Error in conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate conversation: {str(e)}")

@app.post("/api/ai/test-role")
async def test_role(request: TestRoleRequest):
    """Test a single role with a question."""
    roles_data = load_roles()
    if request.role_name not in roles_data["roles"]:
        raise HTTPException(status_code=404, detail="Role not found")
    
    role = roles_data["roles"][request.role_name]
    try:
        # Create context that includes the role's description
        context = f"You are acting as a {role['name']} - {role['description']}"
        if role.get('system_prompt'):
            context += f"\n\n{role['system_prompt']}"
        
        response = await gemini_service.generate_response(
            prompt=request.question,
            context=context,
            max_tokens=request.max_tokens or role['max_tokens']
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 