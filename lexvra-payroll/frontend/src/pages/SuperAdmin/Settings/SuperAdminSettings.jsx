import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Divider } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { saLoginSuccess } from '../../../redux/slices/superAdminAuthSlice';

const SuperAdminSettings = () => {
  const { user, token } = useSelector(state => state.superAdminAuth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await axiosClient.put('/superadmin/settings/profile', { name, avatar: avatarUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        dispatch(saLoginSuccess({ user: res.user, token }));
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoadingPassword(true);
    try {
      const res = await axiosClient.put('/superadmin/settings/password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Account Settings</Typography>
      <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>Manage your Super Admin profile and security preferences.</Typography>

      <Grid container spacing={4}>
        
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4318FF' }}><PersonIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Public Profile</Typography>
            </Box>
            
            <form onSubmit={handleProfileUpdate}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar src={avatarUrl} sx={{ width: 80, height: 80, border: '2px solid #E2E8F0' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>Avatar URL</Typography>
                  <TextField 
                    size="small" 
                    fullWidth 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)} 
                    placeholder="https://..." 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>Display Name</Typography>
              <TextField 
                fullWidth 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <Button type="submit" disabled={loadingProfile} variant="contained" sx={{ bgcolor: '#4318FF', color: '#fff', borderRadius: '10px', py: 1.5, px: 4, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#3311DB' } }}>
                {loadingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: '#FCE7F3', color: '#DB2777' }}><LockIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Change Password</Typography>
            </Box>

            <form onSubmit={handlePasswordUpdate}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>Current Password</Typography>
              <TextField 
                fullWidth 
                type="password"
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                required
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>New Password</Typography>
              <TextField 
                fullWidth 
                type="password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>Confirm New Password</Typography>
              <TextField 
                fullWidth 
                type="password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
                sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <Button type="submit" disabled={loadingPassword} variant="contained" sx={{ bgcolor: '#0F172A', color: '#fff', borderRadius: '10px', py: 1.5, px: 4, fontWeight: 800, textTransform: 'none' }}>
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default SuperAdminSettings;
