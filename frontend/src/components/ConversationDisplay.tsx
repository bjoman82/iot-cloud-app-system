import React, { useState } from 'react';

interface Message {
  role: string;
  content: string;
}

interface Role {
  name: string;
  description: string;
}

interface ConversationDisplayProps {
  messages: Message[];
  isLoading: boolean;
  roles: Role[];
  onUserInput: (input: string, nextSpeaker?: string) => void;
}

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
  isLoading,
  roles,
  onUserInput,
}) => {
  const [userInput, setUserInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const getMessageStyle = (role: string) => ({
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '0.5rem',
    maxWidth: '80%',
    backgroundColor: role === 'user' ? '#e2e8f0' : '#3182ce',
    color: role === 'user' ? '#1a202c' : 'white',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      onUserInput(userInput, selectedRole);
      setUserInput('');
      setSelectedRole('');
    }
  };

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Conversation
      </h2>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={getMessageStyle(message.role)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {message.role === 'user' ? 'You' : message.role}
            </div>
            <div>{message.content}</div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #3182ce',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
          borderTop: '1px solid #ccc',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
              flex: '0 0 200px',
            }}
          >
            <option value="">Select a role to respond (optional)</option>
            {roles.map((role) => (
              <option key={role.name} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              opacity: isLoading || !userInput.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </div>
      </form>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}; 