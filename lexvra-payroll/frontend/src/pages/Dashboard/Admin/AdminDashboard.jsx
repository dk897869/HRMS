import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Avatar, Chip, LinearProgress, Divider, Paper, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import FreeBreakfastOutlinedIcon from '@mui/icons-material/FreeBreakfastOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 10px 30px rgba(112, 144, 176, 0.12)',
  padding: '24px',
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(112, 144, 176, 0.18)',
  }
}));

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosClient.get('/dashboard/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.log(err);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F4F7FE', minHeight: '100vh', width: '100%' }}>
      {/* Header Area */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B254B', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            Good Morning, Admin <span style={{ fontSize: '2rem' }}>👋</span>
          </Typography>
          <Typography sx={{ color: '#A3AED0', fontWeight: 600, mt: 0.5, fontSize: '0.95rem' }}>
            Overview of your organization — {today}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 800, color: '#1B254B', borderColor: '#E2E8F0', bgcolor: '#fff', px: 3, py: 1 }}>
            Export Report
          </Button>
          <Button variant="contained" sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 800, bgcolor: '#4318FF', '&:hover': { bgcolor: '#3311DB' }, px: 3, py: 1, boxShadow: '0 4px 14px rgba(67, 24, 255, 0.4)' }}>
            Quick Actions
          </Button>
        </Box>
      </Box>

      {/* Main KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'TOTAL EMPLOYEES', value: stats?.totalEmployees || 0, icon: <PeopleOutlinedIcon />, color: '#4318FF', bg: '#F4F7FE' },
          { label: 'CURRENTLY WORKING', value: stats?.currentlyWorking || 0, icon: <ComputerOutlinedIcon />, color: '#01B574', bg: '#E6F8F3' },
          { label: 'ON BREAK', value: stats?.onBreak || 0, icon: <FreeBreakfastOutlinedIcon />, color: '#FFB547', bg: '#FFF7EB' },
          { label: 'TIME OFF TODAY', value: stats?.timeOffToday || 0, icon: <BeachAccessOutlinedIcon />, color: '#E31A1A', bg: '#FCECEC' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <GlassCard sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 60, height: 60, '& svg': { fontSize: '2rem' } }}>{stat.icon}</Avatar>
              <Box>
                <Typography sx={{ color: '#A3AED0', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}>{stat.label}</Typography>
                <Typography sx={{ color: '#1B254B', fontWeight: 900, fontSize: '1.8rem', mt: 0.5 }}>{stat.value}</Typography>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Second Row: Activities & Pending */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} lg={7}>
          <GlassCard>
            <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900, mb: 3 }}>Recent Activities</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(stats?.recentActivities || []).map((act, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F1F5F9' }, transition: '0.2s' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={act.img} sx={{ width: 48, height: 48 }} />
                    <Box>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.95rem' }}>{act.name}</Typography>
                      <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>{act.sub}</Typography>
                    </Box>
                  </Box>
                  <Chip label={act.tag} sx={{ bgcolor: act.bg, color: act.color, fontWeight: 800, borderRadius: '8px' }} />
                </Box>
              ))}
              {!stats?.recentActivities?.length && <Typography sx={{ color: '#64748B' }}>Loading activities...</Typography>}
            </Box>
          </GlassCard>
        </Grid>

        {/* Pending Approvals & Holidays */}
        <Grid item xs={12} lg={5}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <GlassCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900 }}>Pending Approvals</Typography>
                  <Avatar sx={{ bgcolor: '#FFF1F2', color: '#E11D48', width: 40, height: 40 }}><AssignmentLateOutlinedIcon /></Avatar>
                </Box>
                <Grid container spacing={2}>
                  {(stats?.pendingApprovalsList || []).map((item, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: item.bg, border: `1px solid ${item.color}33`, textAlign: 'center' }}>
                        <Typography sx={{ color: item.color, fontWeight: 900, fontSize: '1.8rem' }}>{item.count}</Typography>
                        <Typography sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', mt: 1 }}>{item.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </GlassCard>
            </Grid>

            <Grid item>
              <GlassCard>
                <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900, mb: 3 }}>Upcoming Holidays</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(stats?.upcomingHolidays || []).map((holiday, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '16px', bgcolor: holiday.bg, border: `1px solid ${holiday.border}` }}>
                      <Typography sx={{ fontSize: '2rem', mr: 2 }}>{holiday.flag}</Typography>
                      <Box>
                        <Typography sx={{ color: holiday.text, fontWeight: 900, fontSize: '1rem' }}>{holiday.name}</Typography>
                        <Typography sx={{ color: holiday.text, opacity: 0.8, fontWeight: 700, fontSize: '0.8rem' }}>{holiday.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
