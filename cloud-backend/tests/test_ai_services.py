import asyncio
import sys
import os
import argparse
from pathlib import Path

# Add the parent directory to the Python path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from app.ai_services.gemini_service import GeminiService
from app.ai_services.config import AI_ROLES

async def test_single_response():
    """Test generating a single response from the AI."""
    print("\n=== Testing Single Response ===")
    try:
        # Initialize the service with the business role config
        service = GeminiService(AI_ROLES["business"])
        
        # Test prompt - shorter for testing
        prompt = "What are 2-3 key considerations for implementing AI in a small business?"
        
        print(f"\nSending prompt: {prompt}")
        response = await service.generate_response(prompt)
        print(f"\nResponse received:\n{response}")
        
        return True
    except Exception as e:
        print(f"Error in single response test: {str(e)}")
        return False

async def test_conversation():
    """Test generating a conversation between multiple AI roles."""
    print("\n=== Testing Multi-Role Conversation ===")
    try:
        # Initialize the service with the business role config
        service = GeminiService(AI_ROLES["business"])
        
        # Test topic - shorter for testing
        topic = "AI in small business"
        roles = ["business", "technical"]  # Reduced to 2 roles for testing
        
        print(f"\nStarting conversation about: {topic}")
        print(f"Participants: {', '.join(roles)}")
        
        conversation = await service.generate_conversation(
            topic=topic,
            roles=roles,
            max_turns=1  # Reduced to 1 turn for testing
        )
        
        print("\nConversation generated:")
        for message in conversation:
            print(f"\n{message['role'].upper()}: {message['content']}")
        
        return True
    except Exception as e:
        print(f"Error in conversation test: {str(e)}")
        return False

async def main():
    """Run tests based on command line arguments."""
    parser = argparse.ArgumentParser(description='Test AI Services')
    parser.add_argument('--test', choices=['single', 'conversation', 'all'], 
                      default='all', help='Which test to run')
    args = parser.parse_args()

    print("Starting AI Services Tests...")
    
    # Check if API key is set
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY environment variable is not set!")
        return
    
    # Run selected tests
    if args.test in ['single', 'all']:
        print("\nRunning single response test...")
        single_response_success = await test_single_response()
    else:
        single_response_success = None
    
    if args.test in ['conversation', 'all']:
        if args.test == 'all' and not single_response_success:
            print("\nSkipping conversation test due to single response test failure")
            conversation_success = False
        else:
            print("\nRunning conversation test...")
            conversation_success = await test_conversation()
    else:
        conversation_success = None
    
    # Print summary
    print("\n=== Test Summary ===")
    if single_response_success is not None:
        print(f"Single Response Test: {'✓' if single_response_success else '✗'}")
    if conversation_success is not None:
        print(f"Conversation Test: {'✓' if conversation_success else '✗'}")

if __name__ == "__main__":
    asyncio.run(main()) 