import React, { useState, useEffect } from 'react';

interface Role {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
  original_name?: string;
}

interface RoleDebugPanelProps {
  onRolesUpdated: (roles: Role[]) => void;
}

export const RoleDebugPanel: React.FC<RoleDebugPanelProps> = ({ onRolesUpdated }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState<Role>({
    name: '',
    description: '',
    model: 'gemini-pro',
    temperature: 0.7,
    max_tokens: 500,
    system_prompt: '',
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Fetch existing roles when component mounts
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      // Ensure we're setting an array, even if empty
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Failed to fetch roles');
      // Set empty array on error to prevent undefined
      setRoles([]);
    }
  };

  const handleSaveRole = async () => {
    try {
      console.log('Attempting to save role:', newRole);
      
      const endpoint = selectedRole ? '/api/roles/update' : '/api/roles/add';
      console.log('Using endpoint:', endpoint);
      
      const requestBody: Role = {
        name: newRole.name,
        description: newRole.description,
        model: newRole.model,
        temperature: newRole.temperature,
        max_tokens: newRole.max_tokens,
        system_prompt: newRole.system_prompt || '',
      };

      // If we're updating an existing role, include the original name
      if (selectedRole) {
        requestBody.original_name = selectedRole.name;
      }

      console.log('Request body:', requestBody);

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to save role');
      }
      
      const responseData = await response.json();
      console.log('Success response:', responseData);
      
      await fetchRoles();
      setIsEditing(false);
      setSelectedRole(null);
      setNewRole({
        name: '',
        description: '',
        model: 'models/gemini-2.0-flash-lite',
        temperature: 0.7,
        max_tokens: 500,
        system_prompt: '',
      });
    } catch (error) {
      console.error('Detailed error in handleSaveRole:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert(error instanceof Error ? error.message : 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    setRoleToDelete(roleName);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/roles/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roleToDelete }),
      });

      if (!response.ok) throw new Error('Failed to delete role');
      
      await fetchRoles();
      if (selectedRole?.name === roleToDelete) {
        setSelectedRole(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    } finally {
      setShowConfirmModal(false);
      setRoleToDelete(null);
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRole({ ...role });
    setIsEditing(true);
  };

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        AI Role Configuration
      </h2>

      {/* Role List */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Available Roles
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {roles.map((role) => (
            <div
              key={role.name}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{role.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>{role.description}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEditRole(role)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#3182ce',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRole(role.name)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Editor */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {isEditing ? 'Edit Role' : 'Add New Role'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input
              type="text"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <input
              type="text"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model</label>
            <select
              value={newRole.model}
              onChange={(e) => setNewRole({ ...newRole, model: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
            >
              <option value="models/gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Temperature</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={newRole.temperature}
              onChange={(e) => setNewRole({ ...newRole, temperature: parseFloat(e.target.value) })}
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
              value={newRole.max_tokens}
              onChange={(e) => setNewRole({ ...newRole, max_tokens: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>System Prompt</label>
            <textarea
              value={newRole.system_prompt || ''}
              onChange={(e) => setNewRole({ ...newRole, system_prompt: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
              }}
              placeholder="Enter the system prompt that defines this role's behavior..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSaveRole}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              {isEditing ? 'Update Role' : 'Add Role'}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedRole(null);
                  setNewRole({
                    name: '',
                    description: '',
                    model: 'gemini-pro',
                    temperature: 0.7,
                    max_tokens: 500,
                    system_prompt: '',
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#718096',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Confirm Delete
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Are you sure you want to delete the role "{roleToDelete}"?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRoleToDelete(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#718096',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 