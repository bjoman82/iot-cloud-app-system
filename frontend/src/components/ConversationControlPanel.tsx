import React, { useState } from 'react';

interface Role {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

interface ConversationControlPanelProps {
  roles: Role[];
  onStartConversation: (settings: ConversationSettings) => void;
  onTestRole: (role: string, question: string) => void;
}

interface ConversationSettings {
  topic: string;
  maxTurns: number;
  maxTokens: number;
  activeRoles: string[];
}

export const ConversationControlPanel: React.FC<ConversationControlPanelProps> = ({
  roles,
  onStartConversation,
  onTestRole,
}) => {
  const [topic, setTopic] = useState('');
  const [maxTurns, setMaxTurns] = useState(2);
  const [maxTokens, setMaxTokens] = useState(300);
  const [activeRoles, setActiveRoles] = useState<string[]>(roles.map(role => role.name));
  const [testRole, setTestRole] = useState(roles[0]?.name || '');
  const [testQuestion, setTestQuestion] = useState('');

  const handleStartConversation = () => {
    if (!topic.trim()) {
      alert('Please enter a topic for the conversation');
      return;
    }

    onStartConversation({
      topic,
      maxTurns,
      maxTokens,
      activeRoles,
    });
  };

  const handleTestRole = () => {
    if (!testQuestion.trim()) {
      alert('Please enter a question for the role');
      return;
    }

    onTestRole(testRole, testQuestion);
  };

  const handleRoleToggle = (roleName: string) => {
    setActiveRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Conversation Controls</h2>
        
        {/* Topic Input */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter conversation topic"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
        </div>

        {/* Max Turns Control */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Max Turns</label>
          <input
            type="number"
            value={maxTurns}
            onChange={(e) => setMaxTurns(Number(e.target.value))}
            min={1}
            max={5}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
        </div>

        {/* Max Tokens Control */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Max Tokens per Response</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            min={100}
            max={1000}
            step={100}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
            }}
          />
        </div>

        {/* Active Roles Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Active Roles</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {roles.map((role) => (
              <div key={role.name} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={activeRoles.includes(role.name)}
                  onChange={() => handleRoleToggle(role.name)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>{role.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Conversation Button */}
        <button
          onClick={handleStartConversation}
          disabled={!topic.trim() || activeRoles.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            opacity: (!topic.trim() || activeRoles.length === 0) ? 0.5 : 1,
          }}
        >
          Start Conversation
        </button>

        {/* Test Role Section */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Test Individual Role</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Role</label>
            <select
              value={testRole}
              onChange={(e) => setTestRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
            >
              {roles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Question</label>
            <textarea
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="Enter your question for the selected role"
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
            />
          </div>

          <button
            onClick={handleTestRole}
            disabled={!testQuestion.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              opacity: !testQuestion.trim() ? 0.5 : 1,
            }}
          >
            Test Role
          </button>
        </div>
      </div>
    </div>
  );
}; 