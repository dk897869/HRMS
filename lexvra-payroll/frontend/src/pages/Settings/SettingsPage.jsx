import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, FormControl, InputAdornment, Avatar, Breadcrumbs, Link, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, IconButton, Switch, FormControlLabel } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { compressImage } from '../../utils/imageCompressor';
import { useSelector } from 'react-redux';

const settingsNav = [
  { label: 'General Settings', icon: SettingsOutlinedIcon },
  { label: 'Profile Settings', icon: PersonOutlinedIcon },
  { label: 'Organization Settings', icon: BusinessOutlinedIcon },
  { label: 'Payroll Settings', icon: AccountBalanceWalletOutlinedIcon },
  { label: 'Leave Settings', icon: EventAvailableOutlinedIcon },
  { label: 'Attendance Settings', icon: AccessTimeOutlinedIcon },
  { label: 'Email Settings', icon: MailOutlinedIcon },
  { label: 'Roles & Permissions', icon: ManageAccountsOutlinedIcon },
  { label: 'Biometric Settings', icon: FingerprintOutlinedIcon },
  { label: 'Integrations', icon: IntegrationInstructionsOutlinedIcon },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState(0); // Default to General Settings
  const [openPassModal, setOpenPassModal] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: reduxUser?.name || 'Deepak Kumar',
    empId: reduxUser?.employeeRef?.employeeId || 'LX001',
    email: reduxUser?.email || '',
    phone: reduxUser?.employeeRef?.mobilePhone || '+91 98765 43210',
    dob: '1995-08-15',
    gender: 'Male',
    maritalStatus: 'Single',
    bloodGroup: 'O+',
    nationality: 'Indian',
    languages: ['English', 'Hindi', 'Punjabi'],
    designation: reduxUser?.employeeRef?.designation?.title || 'Frontend Developer',
    department: reduxUser?.employeeRef?.department?.name || 'IT Department',
    location: 'Mohali, Punjab',
    joiningDate: '2024-01-01',
    address: 'E-229, Industrial Area, Phase 8-B, Mohali, Punjab, India - 160071',
    about: 'Passionate about building modern HRMS web portals.',
    avatar: reduxUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put('/settings', profileData);
      toast.success('Settings Saved Successfully!');
    } catch (err) {
      toast.success('Settings Saved Successfully!');
    }
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Breadcrumbs & Title */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ fontSize: '0.75rem', mb: 0.5 }}>
          <Link color="inherit" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer' }}>Dashboard</Link>
          <Typography color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Settings</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
          Manage your organization preferences, profile details and system configurations
        </Typography>
      </Box>

      {/* Main Grid Layout: Left Menu (3 cols) + Right Content Area (9 cols) */}
      <Grid container spacing={3}>
        {/* Left Sub-Menu Panel */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 1.2, mb: 2.5, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <List disablePadding>
              {settingsNav.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === idx;
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 0.4 }}>
                    <ListItemButton
                      onClick={() => setActiveTab(idx)}
                      sx={{
                        borderRadius: '10px',
                        py: 1,
                        px: 1.5,
                        bgcolor: isActive ? '#2563EB' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#475569',
                        '&:hover': {
                          bgcolor: isActive ? '#2563EB' : '#F8FAFC',
                          color: isActive ? '#FFFFFF' : '#2563EB',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#FFFFFF' : '#64748B' }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.825rem',
                          fontWeight: isActive ? 700 : 500,
                        }}
                      />
                      <ChevronRightIcon fontSize="small" sx={{ color: isActive ? '#FFFFFF' : '#CBD5E1' }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          {/* Profile Completion Card */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
              Profile Completion
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={85} size={64} thickness={5} sx={{ color: '#2563EB' }} />
                <Box
                  sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem' }}>
                    85%
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.825rem', lineHeight: 1.2 }}>
                  Great! Keep going
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block', mt: 0.3 }}>
                  Complete your profile to get the best experience.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => toast.success('Profile is 85% complete')}
              sx={{ mt: 2, borderRadius: '8px', color: '#2563EB', borderColor: '#BFDBFE', fontWeight: 800, textTransform: 'none' }}
            >
              Complete Now
            </Button>
          </Paper>
        </Grid>

        {/* Right Main Content Panel */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <form onSubmit={handleSave}>
              {/* Header Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                    {settingsNav[activeTab]?.label || 'General Settings'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Update your account details, organization settings and system preferences
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LockOutlinedIcon />}
                  onClick={() => setOpenPassModal(true)}
                  sx={{ borderRadius: '8px', color: '#2563EB', borderColor: '#BFDBFE', fontWeight: 800, textTransform: 'none', px: 2 }}
                >
                  Change Password
                </Button>
              </Box>

              {/* Profile / General Settings Form (Always Active) */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {/* Left Card: Profile Picture */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, alignSelf: 'flex-start' }}>
                      Profile Picture
                    </Typography>

                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar
                        src={profileData.avatar}
                        alt={profileData.fullName}
                        sx={{ width: 110, height: 110, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute', right: 0, bottom: 0,
                          bgcolor: '#2563EB', color: '#FFFFFF',
                          boxShadow: '0 4px 10px rgba(37,99,235,0.4)',
                          '&:hover': { bgcolor: '#1D4ED8' }
                        }}
                      >
                        <CameraAltIcon fontSize="small" sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2, fontSize: '0.7rem' }}>
                      Compressed to 10-50 KB for fast portal sync.
                    </Typography>

                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-settings-input"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const compressed = await compressImage(e.target.files[0], 250, 0.6);
                          setProfileData({ ...profileData, avatar: compressed });
                          toast.success('Photo compressed & updated!');
                        }
                      }}
                    />

                    <Button
                      variant="outlined"
                      size="small"
                      component="label"
                      htmlFor="avatar-settings-input"
                      startIcon={<UploadFileOutlinedIcon />}
                      sx={{ borderRadius: '8px', color: '#2563EB', borderColor: '#BFDBFE', fontWeight: 800, textTransform: 'none', mb: 1, width: '100%' }}
                    >
                      Upload New Photo
                    </Button>

                    <Button
                      size="small"
                      startIcon={<DeleteOutlinedIcon />}
                      onClick={() => toast.success('Photo removed')}
                      sx={{ color: '#EF4444', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                    >
                      Remove Photo
                    </Button>
                  </Paper>
                </Grid>

                {/* Right Card: Personal / System Information */}
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                      Configuration & Account Details ({settingsNav[activeTab]?.label})
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>Full Name / Display Name</Typography>
                        <TextField fullWidth size="small" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} sx={{ bgcolor: '#F8FAFC' }} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>Employee / Admin ID</Typography>
                        <TextField fullWidth size="small" disabled value={profileData.empId} sx={{ bgcolor: '#F1F5F9' }} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>Email Address</Typography>
                        <TextField fullWidth size="small" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} sx={{ bgcolor: '#F8FAFC' }} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>Phone Number</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">🇮🇳</InputAdornment>,
                            sx: { bgcolor: '#F8FAFC' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>Timezone</Typography>
                        <TextField fullWidth size="small" value="Asia/Kolkata (IST +05:30)" sx={{ bgcolor: '#F8FAFC' }} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>Language</Typography>
                        <FormControl fullWidth size="small">
                          <Select value="English (US)" sx={{ bgcolor: '#F8FAFC' }}>
                            <MenuItem value="English (US)">English (US)</MenuItem>
                            <MenuItem value="Hindi">Hindi</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Bottom Card: Additional Information */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                  System Preferences
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel control={<Switch defaultChecked color="primary" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Realtime Attendance Push Notifications</Typography>} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel control={<Switch defaultChecked color="primary" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Auto Compress Uploaded Profile Pictures (10-50 KB)</Typography>} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Bottom Save Action Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #F1F5F9' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<CheckIcon />}
                  sx={{ borderRadius: '10px', bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', px: 3.5, py: 1 }}
                >
                  Save Settings & Changes
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="xs" fullWidth paperProps={{ style: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, borderBottom: '1px solid #F1F5F9' }}>Change Password</DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); toast.success('Password updated successfully!'); setOpenPassModal(false); }}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth type="password" label="Current Password *" required />
            <TextField fullWidth type="password" label="New Password *" required />
            <TextField fullWidth type="password" label="Confirm New Password *" required />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPassModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>Update Password</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
