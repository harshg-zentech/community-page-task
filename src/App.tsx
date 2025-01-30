import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import PostCreationForm from './components/PostCreationForm';
import PostList from './components/PostList';
import AppTheme from './styles/AppTheme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      <ToastContainer
        position={isMobile ? "bottom-center" : "top-right"}
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          fontSize: isMobile ? '14px' : '16px',
          width: isMobile ? '90%' : '400px',
          margin: isMobile ? '0 auto' : undefined
        }}
        toastClassName={`custom-toast ${isMobile ? 'mobile' : ''}`}
      />
    </AppTheme>
  );
};

export default App;
