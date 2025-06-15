import React from 'react';

interface Message {
  role: string;
  content: string;
}

interface ConversationDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
  isLoading,
}) => {
  const getMessageStyle = (role: string) => ({
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '0.5rem',
    maxWidth: '80%',
    backgroundColor: role === 'user' ? '#e2e8f0' : '#3182ce',
    color: role === 'user' ? '#1a202c' : 'white',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  });

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