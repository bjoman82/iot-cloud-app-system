import React, { useState, useEffect } from 'react';

interface Role {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
}

interface ConversationControlPanelProps {
  onStartConversation: (settings: ConversationSettings) => void;
}

interface ConversationSettings {
  topic: string;
  max_turns: number;
  max_tokens: number;
  active_roles: string[];
}

export const ConversationControlPanel: React.FC<ConversationControlPanelProps> = ({ onStartConversation }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [topic, setTopic] = useState('');
  const [maxTurns, setMaxTurns] = useState(3);
  const [maxTokens, setMaxTokens] = useState(500);
  const [activeRoles, setActiveRoles] = useState<string[]>([]);

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

  const handleRoleToggle = (roleName: string) => {
    setActiveRoles(prev => 
      prev.includes(roleName)
        ? prev.filter(name => name !== roleName)
        : [...prev, roleName]
    );
  };

  const handleStartConversation = () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }
    if (activeRoles.length === 0) {
      alert('Please select at least one role');
      return;
    }
    onStartConversation({
      topic,
      max_turns: maxTurns,
      max_tokens: maxTokens,
      active_roles: activeRoles,
    });
  };

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      marginBottom: '1rem',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Conversation Controls
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter conversation topic..."
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Max Turns</label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxTurns}
            onChange={(e) => setMaxTurns(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Max Tokens</label>
          <input
            type="number"
            min="100"
            max="1000"
            step="100"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Active Roles</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {roles.map((role) => (
              <label key={role.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={activeRoles.includes(role.name)}
                  onChange={() => handleRoleToggle(role.name)}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{role.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{role.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartConversation}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Start Conversation
        </button>
      </div>
    </div>
  );
}; 