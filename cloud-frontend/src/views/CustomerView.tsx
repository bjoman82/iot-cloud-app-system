import React from 'react';
import { Typography, Card, CardContent, Grid, Box } from '@mui/material';

interface AIRole {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

const mockAIRoles: AIRole[] = [
  {
    id: '1',
    name: 'Assistant',
    description: 'A helpful AI assistant that can answer questions and provide support.',
    status: 'active'
  },
  {
    id: '2',
    name: 'Analyst',
    description: 'An AI that analyzes data and provides insights.',
    status: 'active'
  }
];

const CustomerView: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Team Members
      </Typography>
      <Grid container spacing={3}>
        {mockAIRoles.map((role) => (
          <Grid item xs={12} md={6} key={role.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {role.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {role.description}
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    color: role.status === 'active' ? 'success.main' : 'error.main'
                  }}
                >
                  Status: {role.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CustomerView; 