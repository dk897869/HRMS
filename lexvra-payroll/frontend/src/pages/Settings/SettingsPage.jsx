import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Avatar, Breadcrumbs, Link, IconButton, Divider
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { compressImage } from '../../utils/imageCompressor';

const SettingsPage = () => {
  const navigate = useNavigate();

  const [orgData, setOrgData] = useState({
    companyName: 'PayFlexPayroll',
    companyEmail: 'contact@payflexpayroll.com',
    companyPhone: '+91 98765 43210',
    website: 'www.payflexpayroll.com',
    gstNumber: '',
    address: 'E-229, Industrial Area, Phase 8-B, Mohali, Punjab 160055, India',
    companyLogoUrl: '/PayFlexPayroll Logo.png',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings');
      if (res.data?.data) {
        setOrgData((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 200);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgData({ ...orgData, companyLogoUrl: reader.result });
        toast.success('Logo updated! Save settings to apply.');
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      toast.error('Failed to process image');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.put('/settings', orgData);
      toast.success('Organization Settings Saved Successfully!');
      setTimeout(() => {
        window.location.reload(); // Force reload to apply logo everywhere
      }, 1500);
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F4F7FE', p: { xs: 2, md: 4 } }}>
      {/* Breadcrumbs & Title */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ fontSize: '0.85rem', mb: 1 }}>
          <Link color="inherit" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#4318FF' } }}>Dashboard</Link>
          <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Organization Settings</Typography>
        </Breadcrumbs>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B254B', lineHeight: 1.2 }}>
          Organization Setup
        </Typography>
        <Typography variant="body1" sx={{ color: '#A3AED0', mt: 1, fontWeight: 500 }}>
          Manage your company details, logo, and legal information. These details will reflect on Salary Slips and Offer Letters.
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(112, 144, 176, 0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B', mb: 3 }}>
              Company Logo
            </Typography>

            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar
                src={orgData.companyLogoUrl}
                alt="Company Logo"
                variant="rounded"
                sx={{ width: 160, height: 160, boxShadow: '0 8px 24px rgba(67, 24, 255, 0.15)', border: '2px solid #E2E8F0', bgcolor: '#F4F7FE', objectFit: 'contain' }}
              />
              <IconButton
                component="label"
                sx={{
                  position: 'absolute', right: -10, bottom: -10,
                  bgcolor: '#4318FF', color: '#FFFFFF',
                  boxShadow: '0 4px 10px rgba(67, 24, 255, 0.4)',
                  '&:hover': { bgcolor: '#3311DB' }
                }}
              >
                <CameraAltIcon />
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </IconButton>
            </Box>

            <Typography variant="body2" sx={{ color: '#A3AED0', px: 2 }}>
              Upload your company logo. This will be visible on the sidebar and all generated documents.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(112, 144, 176, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: '#F4F7FE', color: '#4318FF', width: 48, height: 48 }}>
                <BusinessOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1B254B' }}>
                Legal Details
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: '#F4F7FE' }} />

            <form onSubmit={handleSave}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', mb: 1, display: 'block' }}>Company Name</Typography>
                  <TextField fullWidth name="companyName" value={orgData.companyName} onChange={handleInputChange} variant="outlined" size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} required />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', mb: 1, display: 'block' }}>GST Number</Typography>
                  <TextField fullWidth name="gstNumber" value={orgData.gstNumber} onChange={handleInputChange} variant="outlined" size="medium" placeholder="Enter GSTIN" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', mb: 1, display: 'block' }}>Company Email</Typography>
                  <TextField fullWidth type="email" name="companyEmail" value={orgData.companyEmail} onChange={handleInputChange} variant="outlined" size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} required />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', mb: 1, display: 'block' }}>Company Phone</Typography>
                  <TextField fullWidth name="companyPhone" value={orgData.companyPhone} onChange={handleInputChange} variant="outlined" size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                
                <Grid item xs={12} sm={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', mb: 1, display: 'block' }}>Website</Typography>
                  <TextField fullWidth name="website" value={orgData.website} onChange={handleInputChange} variant="outlined" size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', mb: 1, display: 'block' }}>Registered Address</Typography>
                  <TextField fullWidth name="address" value={orgData.address} onChange={handleInputChange} variant="outlined" size="medium" multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} required />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={<SaveOutlinedIcon />}
                    sx={{ borderRadius: '14px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 800, fontSize: '1rem', bgcolor: '#4318FF', '&:hover': { bgcolor: '#3311DB' }, boxShadow: '0 4px 14px rgba(67, 24, 255, 0.4)' }}
                  >
                    {saving ? 'Saving...' : 'Save Organization Details'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
