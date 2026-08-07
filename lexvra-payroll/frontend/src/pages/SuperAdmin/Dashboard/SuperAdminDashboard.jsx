import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSignups, setRecentSignups] = useState([]);
  const { token } = useSelector(state => state.superAdminAuth);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Temporarily bypass token in axios interceptor for this specifically if needed,
      // but assuming axiosClient uses localStorage token, we need to pass the sa_token.
      // In a real app we'd configure an axios instance specifically for super admin,
      // or the interceptor handles it. For now let's pass headers directly.
      const res = await axiosClient.get('/superadmin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setStats(res.stats);
        setRecentSignups(res.recentSignups);
      }
    } catch (err) {
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return { bg: '#ECFDF5', color: '#10B981' };
      case 'Trial': return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'Expired': return { bg: '#FEF2F2', color: '#EF4444' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const kpis = stats ? [
    { label: 'Total Companies', value: stats.totalCompanies, icon: <BusinessIcon />, bg: '#EEF2FF', color: '#4318FF' },
    { label: 'Active Companies', value: stats.activeCompanies, icon: <CheckCircleIcon />, bg: '#ECFDF5', color: '#10B981' },
    { label: 'Free Trials', value: stats.freeTrials, icon: <AccessTimeIcon />, bg: '#FEF3C7', color: '#F59E0B' },
    { label: 'Expired Plans', value: stats.expiredPlans, icon: <CancelIcon />, bg: '#FEF2F2', color: '#EF4444' },
    { label: 'Total Employees', value: stats.totalEmployees, icon: <PeopleIcon />, bg: '#F3E8FF', color: '#7E22CE' },
    { label: 'Monthly MRR', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: <CurrencyRupeeIcon />, bg: '#E0F2FE', color: '#0284C7' },
    { label: 'Yearly ARR', value: `₹${stats.yearlyRevenue.toLocaleString()}`, icon: <CurrencyRupeeIcon />, bg: '#FCE7F3', color: '#DB2777' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <CurrencyRupeeIcon />, bg: '#DCFCE7', color: '#15803D' },
  ] : Array(8).fill({ label: 'Loading...', value: '-', icon: <BusinessIcon />, bg: '#F8FAFC', color: '#CBD5E1' });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Platform Overview</Typography>
      <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>
        Real-time metrics and revenue across all SaaS tenants.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' } }}>
              <Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, width: 56, height: 56 }}>
                {kpi.icon}
              </Avatar>
              <Box>
                <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</Typography>
                <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: '1.6rem', mt: 0.5 }}>{kpi.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 0, borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#fff' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Recent Signups</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Company Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Employees</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentSignups.map((company) => {
                const colors = getStatusColor(company.subscriptionStatus);
                return (
                  <TableRow key={company._id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{company.companyName}</TableCell>
                    <TableCell sx={{ color: '#64748B', fontWeight: 500 }}>{company.email}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>{company.employeesUsed}</TableCell>
                    <TableCell sx={{ color: '#64748B' }}>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={company.subscriptionStatus} size="small" sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 800 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {recentSignups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748B' }}>No signups found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SuperAdminDashboard;
