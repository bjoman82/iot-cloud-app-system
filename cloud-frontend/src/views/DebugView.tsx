import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface AIRoleConfig {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

const initialConfigs: AIRoleConfig[] = [
  {
    id: '1',
    name: 'Assistant',
    systemPrompt: 'You are a helpful AI assistant...',
    temperature: 0.7,
    maxTokens: 2000
  },
  {
    id: '2',
    name: 'Analyst',
    systemPrompt: 'You are an AI analyst...',
    temperature: 0.5,
    maxTokens: 4000
  }
];

const DebugView: React.FC = () => {
  const [configs, setConfigs] = useState<AIRoleConfig[]>(initialConfigs);

  const handleConfigChange = (id: string, field: keyof AIRoleConfig, value: string | number) => {
    setConfigs(configs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ));
  };

  const handleSave = (id: string) => {
    // TODO: Implement save functionality
    console.log('Saving config for role:', id);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Role Configuration
      </Typography>
      <Grid container spacing={3}>
        {configs.map((config) => (
          <Grid item xs={12} key={config.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {config.name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="System Prompt"
                      value={config.systemPrompt}
                      onChange={(e) => handleConfigChange(config.id, 'systemPrompt', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Temperature"
                      value={config.temperature}
                      onChange={(e) => handleConfigChange(config.id, 'temperature', parseFloat(e.target.value))}
                      inputProps={{ step: 0.1, min: 0, max: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Tokens"
                      value={config.maxTokens}
                      onChange={(e) => handleConfigChange(config.id, 'maxTokens', parseInt(e.target.value))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSave(config.id)}
                    >
                      Save Configuration
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DebugView; 