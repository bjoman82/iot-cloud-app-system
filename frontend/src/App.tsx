import React, { useState, useEffect } from 'react';
import { ConversationControlPanel } from './components/ConversationControlPanel';
import { ConversationDisplay } from './components/ConversationDisplay';
import { RoleDebugPanel } from './components/RoleDebugPanel';

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
  system_prompt?: string;
}

interface ConversationSettings {
  topic: string;
  max_turns: number;
  max_tokens: number;
  active_roles: string[];
}

function App() {
  const [activeView, setActiveView] = useState<'conversation' | 'debug'>('conversation');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentSettings, setCurrentSettings] = useState<ConversationSettings | null>(null);

  useEffect(() => {
    // Fetch available roles when component mounts
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Failed to fetch roles');
    }
  };

  const handleStartConversation = async (settings: ConversationSettings) => {
    setIsLoading(true);
    setCurrentTopic(settings.topic);
    setCurrentSettings(settings);
    try {
      const response = await fetch('http://localhost:5000/api/ai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      setMessages(data.conversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInput = async (input: string, nextSpeaker?: string) => {
    if (!currentTopic || !currentSettings) {
      alert('Please start a conversation first');
      return;
    }

    console.log('Sending user input:', { input, nextSpeaker, currentTopic, currentSettings });
    setIsLoading(true);
    try {
      const requestBody = {
        topic: currentTopic,
        max_turns: currentSettings.max_turns,
        max_tokens: currentSettings.max_tokens,
        active_roles: currentSettings.active_roles,
        conversation_history: messages,
        user_input: input,
        next_speaker: nextSpeaker,
      };
      console.log('Request body:', requestBody);

      const response = await fetch('http://localhost:5000/api/ai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to process user input');
      }

      const data = await response.json();
      console.log('Response data:', data);
      setMessages(prev => [...prev, ...data.conversation]);
    } catch (error) {
      console.error('Error processing user input:', error);
      alert('Failed to process user input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          AI Role-Based Conversation System
        </h1>
        
        {/* Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveView('conversation')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeView === 'conversation' ? '#3182ce' : '#e2e8f0',
              color: activeView === 'conversation' ? 'white' : 'black',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Conversation
          </button>
          <button
            onClick={() => setActiveView('debug')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeView === 'debug' ? '#3182ce' : '#e2e8f0',
              color: activeView === 'debug' ? 'white' : 'black',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Role Configuration
          </button>
        </div>

        {activeView === 'conversation' ? (
          <>
            <ConversationControlPanel onStartConversation={handleStartConversation} />
            <ConversationDisplay 
              messages={messages} 
              isLoading={isLoading} 
              roles={roles}
              onUserInput={handleUserInput}
            />
          </>
        ) : (
          <RoleDebugPanel onRolesUpdated={fetchRoles} />
        )}
      </div>
    </div>
  );
}

export default App;
