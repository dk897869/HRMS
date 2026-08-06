import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: '24px',
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '6rem', color: '#2563EB', lineHeight: 1 }}>
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mt: 1, mb: 1 }}>
          Page Not Found
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748B', mb: 3.5, lineHeight: 1.5 }}>
          Oops! The page you are looking for doesn't exist, was removed, or is temporarily unavailable.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: '12px', borderColor: '#CBD5E1', color: '#475569', fontWeight: 800, textTransform: 'none', px: 2.5 }}
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ borderRadius: '12px', bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound;
