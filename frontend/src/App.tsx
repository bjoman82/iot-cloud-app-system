import React, { useState } from 'react';
import { ConversationControlPanel } from './components/ConversationControlPanel';
import { ConversationDisplay } from './components/ConversationDisplay';
import { RoleDebugPanel } from './components/RoleDebugPanel';

interface Message {
  role: string;
  content: string;
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

  const handleStartConversation = async (settings: ConversationSettings) => {
    setIsLoading(true);
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
            <ConversationDisplay messages={messages} isLoading={isLoading} />
          </>
        ) : (
          <RoleDebugPanel onRolesUpdated={() => {}} />
        )}
      </div>
    </div>
  );
}

export default App;
