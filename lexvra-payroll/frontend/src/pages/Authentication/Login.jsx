import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../../redux/slices/authSlice';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@lexvra.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // First Time Login States (User Requirement!)
  const [isFirstTimeModal, setIsFirstTimeModal] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if first time login for added employee
      const checkRes = await axiosClient.post('/auth/check-first-time', { identifier: email }).catch(() => null);

      if (checkRes?.data?.isFirstTime) {
        setEmployeeName(checkRes.data.name);
        setIsFirstTimeModal(true);
        setLoading(false);
        return;
      }

      const res = await axiosClient.post('/auth/login', { email, password });
      if (res.success) {
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.accessToken
        }));
        toast.success(`Welcome back, ${res.data.user.name}!`);

        const role = res.data.user.role?.toUpperCase();
        if (role === 'EMPLOYEE') {
          navigate('/employee-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.message || 'User not registered or invalid credentials. Contact HR.');
    } finally {
      setLoading(false);
    }
  };

  // Setup first time password
  const handleSetupPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await axiosClient.post('/auth/setup-password', { email, password: newPassword });
      if (res.success) {
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.accessToken
        }));
        toast.success(`Password set successfully! Welcome, ${res.data.user.name}!`);
        setIsFirstTimeModal(false);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to setup password');
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '643030462241-hmat42oe4rqk0qb9il1f3bb25o26c2gc.apps.googleusercontent.com';
    
    const initGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
        const container = document.getElementById('googleBtnDiv');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular'
          });
        }
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleBtn;
      document.body.appendChild(script);
    } else {
      initGoogleBtn();
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/google', {
        credential: response.credential
      });

      if (res.success) {
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.accessToken
        }));
        toast.success(`Welcome, ${res.data.user.name}!`);
        const role = res.data.user.role?.toUpperCase();
        if (role === 'EMPLOYEE') {
          navigate('/employee-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Google Login Error:', err);
      toast.error(err.message || 'Google Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '643030462241-hmat42oe4rqk0qb9il1f3bb25o26c2gc.apps.googleusercontent.com';
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In is initializing. Please try again in a moment.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F7FE',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Blob */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '55vw',
          height: '110vh',
          background: 'linear-gradient(135deg, #0B47A9 0%, #062F76 100%)',
          borderRadius: '40% 0 0 50%',
          zIndex: 1,
        }}
      />

      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          zIndex: 2,
          p: { xs: 3, md: 6 },
        }}
      >
        {/* Left Column - Company Branding */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pr: { md: 6 },
          }}
        >
          {/* Top Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                bgcolor: '#0B47A9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.2rem',
              }}
            >
              LX
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0B47A9', lineHeight: 1.1, fontSize: '0.95rem' }}>
                LEXVRA INFINOLOGY
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 700 }}>
                PVT. LTD.
              </Typography>
            </Box>
          </Box>

          {/* Hero Branding */}
          <Box sx={{ my: 'auto', textAlign: 'center', py: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3.5rem', md: '5.5rem' },
                fontWeight: 900,
                color: '#0B47A9',
                fontFamily: 'serif',
                lineHeight: 1,
                mb: 1,
              }}
            >
              Lx
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '1px', mb: 1 }}>
              LEXVRA INFINOLOGY
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '2px', mb: 4 }}>
              — PVT. LTD. —
            </Typography>

            <Typography variant="body1" sx={{ color: '#0B47A9', fontWeight: 700, fontStyle: 'italic', mb: 5 }}>
              Innovate. Integrate. Elevate.
            </Typography>

            {/* Floating Security Badge */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                textAlign: 'left',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#0B47A9',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Secure • Reliable • Efficient
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                  Managing your workforce, made simple.
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Footer Copyright */}
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            © 2026 Lexvra Infinology Pvt. Ltd. All rights reserved.
          </Typography>
        </Box>

        {/* Right Column - Glassmorphic Login Form */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 460,
              p: { xs: 3.5, sm: 5 },
              borderRadius: '24px',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                Welcome Back! 👋
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Sign in to access your dashboard
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Email or Phone Number
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter email address or mobile number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: '#F8FAFC' },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: '#F8FAFC' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{ color: '#0B47A9' }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>Remember Me</Typography>}
                />
                <Button variant="text" size="small" sx={{ color: '#0B47A9', fontWeight: 700, fontSize: '0.75rem' }}>
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  bgcolor: '#0B47A9',
                  borderRadius: '12px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#062F76' },
                }}
              >
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>

            <Divider sx={{ my: 3, color: '#94A3B8', fontSize: '0.8rem' }}>Or</Divider>

            {/* Official Google Sign-In Button Container (Single Button) */}
            <Box sx={{ width: '100%', minHeight: 44, display: 'flex', justifyContent: 'center' }}>
              <div id="googleBtnDiv" style={{ width: '100%' }}></div>
            </Box>

            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', textAlign: 'center', mt: 3, fontSize: '0.725rem' }}>
              By logging in, you accept our <strong style={{ color: '#0B47A9' }}>Terms & Conditions</strong> & <strong style={{ color: '#0B47A9' }}>Privacy Policy</strong>
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* First Time Employee Password Setup Modal (User Requirement!) */}
      <Dialog open={isFirstTimeModal} onClose={() => setIsFirstTimeModal(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleSetupPasswordSubmit}>
          <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyOutlinedIcon sx={{ color: '#2563EB' }} /> First Time Login - Password Setup
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Welcome <strong>{employeeName}</strong>! Please generate your account password for first-time login.
            </Typography>

            <TextField
              fullWidth
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsFirstTimeModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>
              Generate Password & Login
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Login;
