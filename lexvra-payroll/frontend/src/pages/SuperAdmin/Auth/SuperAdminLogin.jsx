import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saLoginSuccess } from '../../../redux/slices/superAdminAuthSlice';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('superadmin@payflexpayroll.com');
  const [password, setPassword] = useState('SuperAdmin@123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // NOTE: Using the new endpoint
      const res = await axiosClient.post('/superadmin/auth/login', { email, password });
      
      if (res && res.success) {
        dispatch(saLoginSuccess({ user: res.user, token: res.token }));
        toast.success('Welcome back, Super Admin!');
        navigate('/super-admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
      <Paper elevation={0} sx={{ p: 6, borderRadius: '24px', width: '100%', maxWidth: 420, border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: '#4318FF', width: 56, height: 56, mb: 2 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A' }}>Super Admin</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 1 }}>Sign in to manage the SaaS platform</Typography>
        </Box>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, py: 1.5, borderRadius: '12px', bgcolor: '#4318FF', color: '#fff', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#3311DB' } }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SuperAdminLogin;
