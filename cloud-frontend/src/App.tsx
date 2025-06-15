import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import CustomerView from './views/CustomerView';
import DebugView from './views/DebugView';

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI System Dashboard
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Customer View
            </Button>
            <Button color="inherit" component={Link} to="/debug">
              Debug View
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<CustomerView />} />
            <Route path="/debug" element={<DebugView />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App; 