import React, { useState } from 'react';
import { ConversationControlPanel } from './components/ConversationControlPanel';
import { ConversationDisplay } from './components/ConversationDisplay';

interface Message {
  role: string;
  content: string;
}

interface Role {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

const roles: Role[] = [
  {
    name: 'Business Analyst',
    description: 'Analyzes business implications and ROI',
    model: 'gemini-pro',
    temperature: 0.7,
    max_tokens: 500,
  },
  {
    name: 'Customer Advocate',
    description: 'Focuses on user experience and customer needs',
    model: 'gemini-pro',
    temperature: 0.7,
    max_tokens: 500,
  },
  {
    name: 'Technical Architect',
    description: 'Provides technical insights and implementation details',
    model: 'gemini-pro',
    temperature: 0.7,
    max_tokens: 500,
  },
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async (settings: {
    topic: string;
    maxTurns: number;
    maxTokens: number;
    activeRoles: string[];
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: settings.topic,
          max_turns: settings.maxTurns,
          max_tokens: settings.maxTokens,
          roles: settings.activeRoles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRole = async (role: string, question: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/test-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          question,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to test role');
      }

      const data = await response.json();
      setMessages([
        { role: 'user', content: question },
        { role: 'model', content: data.message.content },
      ]);
    } catch (error) {
      console.error('Error testing role:', error);
      alert('Failed to test role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        AI Conversation System
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
      }}>
        <div>
          <ConversationControlPanel
            roles={roles}
            onStartConversation={handleStartConversation}
            onTestRole={handleTestRole}
          />
        </div>
        <div>
          <ConversationDisplay
            messages={messages}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
