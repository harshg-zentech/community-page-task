import React from 'react';
import { Box, Typography } from '@mui/material';
import PostCreationForm from './components/PostCreationForm';
import PostList from './components/PostList';
import AppTheme from './styles/AppTheme';

const App: React.FC = () => {


  return (
    <AppTheme>
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', p: 2 }}>
        <Typography variant="h4" gutterBottom textAlign={'center'} mb={3}>
          Community Page
        </Typography>
        <PostCreationForm />
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <PostList />
        </Box>
      </Box>
    </AppTheme>
  );
};

export default App;
