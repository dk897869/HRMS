import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip, Button, Tabs, Tab, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const { token } = useSelector(state => state.superAdminAuth);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      const res = await axiosClient.get(`/superadmin/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setCompany(res.company);
      }
    } catch (err) {
      toast.error('Failed to load company details');
    }
  };

  if (!company) {
    return <Typography sx={{ p: 4 }}>Loading...</Typography>;
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return { bg: '#ECFDF5', color: '#10B981' };
      case 'Trial': return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'Expired': return { bg: '#FEF2F2', color: '#EF4444' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const statusColor = getStatusColor(company.subscriptionStatus);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Button onClick={() => navigate('/super-admin/companies')} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 700 }}>Back</Button>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>Company Profile</Typography>
      </Box>

      {/* Header Profile Card */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#fff', mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar src={company.logoUrl} sx={{ width: 100, height: 100, borderRadius: '20px', bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 900, fontSize: '2.5rem' }}>
              {company.companyName.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A' }}>{company.companyName}</Typography>
              <Chip label={company.subscriptionStatus} sx={{ bgcolor: statusColor.bg, color: statusColor.color, fontWeight: 800 }} />
            </Box>
            <Typography variant="body1" sx={{ color: '#64748B', mb: 2 }}>{company.email} • Joined {new Date(company.createdAt).toLocaleDateString()}</Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" sx={{ bgcolor: '#4318FF', color: '#fff', borderRadius: '10px', fontWeight: 800, textTransform: 'none' }}>Login As Company</Button>
              <Button variant="outlined" sx={{ borderColor: '#E2E8F0', color: '#64748B', borderRadius: '10px', fontWeight: 800, textTransform: 'none' }}>Edit Details</Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle2" sx={{ color: '#64748B', fontWeight: 700, mb: 1 }}>Employees Used</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A' }}>{company.employeesUsed}</Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>/ {company.employeeLimit}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#fff', overflow: 'hidden' }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ borderBottom: '1px solid #E2E8F0', px: 2, pt: 1, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}>
          <Tab label="Overview" />
          <Tab label="Payment History" />
          <Tab label="Activity Logs" />
        </Tabs>
        
        {tabIndex === 0 && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 3 }}>Company Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#64748B' }}>GST Number</Typography><Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{company.gst || 'Not Provided'}</Typography></Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#64748B' }}>PAN Number</Typography><Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{company.pan || 'Not Provided'}</Typography></Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#64748B' }}>Address</Typography><Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{company.address || 'Not Provided'}</Typography></Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 3 }}>System Limits</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#64748B' }}>Storage Used</Typography><Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{company.storageUsedMb} MB / {company.storageLimitMb} MB</Typography></Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#64748B' }}>Current Version</Typography><Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{company.currentVersion}</Typography></Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748B' }}>Payment History will be linked to Invoices collection in Phase 3.</Typography>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748B' }}>Activity logs will be available soon.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CompanyDetails;
