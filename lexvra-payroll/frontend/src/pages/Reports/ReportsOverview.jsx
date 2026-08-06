import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import toast from 'react-hot-toast';

const ReportsOverview = () => {
  const downloadReport = (name) => {
    if (name === 'Employee Report' || name === 'Attendance Report') {
      const type = name === 'Employee Report' ? 'employees' : 'attendance';
      window.open(`${import.meta.env.VITE_API_URL || 'https://lx-hrms-1.onrender.com/api'}/reports/${type}/excel`, '_blank');
    }
    toast.success(`Generating and downloading ${name}...`);
  };

  const reports = [
    { title: 'Attendance Report', desc: 'View attendance summary and details', icon: AccessTimeOutlinedIcon, color: '#3B82F6' },
    { title: 'Payroll Report', desc: 'View payroll summary and details', icon: AccountBalanceWalletOutlinedIcon, color: '#0B47A9' },
    { title: 'Leave Report', desc: 'View leave summary and details', icon: EventAvailableOutlinedIcon, color: '#F59E0B' },
    { title: 'Employee Report', desc: 'View employee directory and details', icon: PeopleOutlinedIcon, color: '#06B6D4' },
    { title: 'Performance Report', desc: 'View performance review details', icon: ShowChartOutlinedIcon, color: '#10B981' },
    { title: 'Reimbursement Report', desc: 'View reimbursement summary', icon: ReceiptLongOutlinedIcon, color: '#8B5CF6' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
          Reports
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Generate and download reports
        </Typography>
      </Box>

      {/* 6 Report Cards Grid matching Screen 8 DITTO */}
      <Grid container spacing={3}>
        {reports.map((r, idx) => {
          const Icon = r.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: `${r.color}15`, color: r.color }}>
                      <Icon fontSize="medium" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {r.title}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 3 }}>
                    {r.desc}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={() => downloadReport(r.title)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: '#475569', borderColor: '#CBD5E1' }}
                >
                  Generate
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ReportsOverview;
