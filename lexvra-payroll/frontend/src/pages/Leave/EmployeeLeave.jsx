import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, IconButton, Skeleton, Alert, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import ChildFriendlyOutlinedIcon from '@mui/icons-material/ChildFriendlyOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const LEAVE_ICON_MAP = {
  'Casual Leave': { icon: BeachAccessOutlinedIcon, iconBg: '#F3E8FF', iconColor: '#9333EA' },
  'Sick Leave': { icon: LocalHospitalOutlinedIcon, iconBg: '#DCFCE7', iconColor: '#10B981' },
  'Earned Leave': { icon: FlightTakeoffOutlinedIcon, iconBg: '#FEF3C7', iconColor: '#D97706' },
  'Comp Off': { icon: WbSunnyOutlinedIcon, iconBg: '#E0F2FE', iconColor: '#0284C7' },
  'Maternity Leave': { icon: ChildFriendlyOutlinedIcon, iconBg: '#F3E8FF', iconColor: '#9333EA' },
};
const DEFAULT_ICON = { icon: BeachAccessOutlinedIcon, iconBg: '#F3E8FF', iconColor: '#9333EA' };

const statusConfig = {
  Approved: { bgcolor: '#DCFCE7', color: '#15803D' },
  approved: { bgcolor: '#DCFCE7', color: '#15803D' },
  APPROVED: { bgcolor: '#DCFCE7', color: '#15803D' },
  Pending: { bgcolor: '#FEF3C7', color: '#D97706' },
  pending: { bgcolor: '#FEF3C7', color: '#D97706' },
  PENDING: { bgcolor: '#FEF3C7', color: '#D97706' },
  Rejected: { bgcolor: '#FEE2E2', color: '#B91C1C' },
  rejected: { bgcolor: '#FEE2E2', color: '#B91C1C' },
  REJECTED: { bgcolor: '#FEE2E2', color: '#B91C1C' },
};

const GlassCard = ({ children, sx, ...props }) => (
  <Paper
    elevation={0}
    {...props}
    sx={{
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.03)',
      borderRadius: '24px',
      overflow: 'hidden',
      ...sx
    }}
  >
    {children}
  </Paper>
);

const EmployeeLeave = () => {
  const user = useSelector((state) => state.auth.user);
  const isEmployee = user?.role?.toUpperCase() === 'EMPLOYEE';

  const [tabFilter, setTabFilter] = useState('All');
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: '', fromDate: '', toDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leavesRes, balRes] = await Promise.all([
        axiosClient.get('/leaves').catch(() => null),
        axiosClient.get('/leaves/my-balances').catch(() => null),
      ]);

      const leavesArr = Array.isArray(leavesRes) ? leavesRes
        : leavesRes?.data || leavesRes?.leaves || [];
      setRequests(leavesArr);

      const balArr = Array.isArray(balRes) ? balRes
        : balRes?.data || balRes?.balances || [];
      
      const balances = balArr.map((b, i) => {
        const t = b.leaveType || {};
        const total = t.daysPerYear || 12;
        const remaining = b.balance || 0;
        const used = Math.max(0, total - remaining);
        
        return {
          id: t._id,
          label: t.name || t.code || 'Leave',
          used: used,
          total: total,
          remaining: remaining,
          // Premium gradients for each card
          gradient: [
            'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', // Indigo to Purple
            'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Emerald
            'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Amber
            'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', // Blue
            'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', // Pink
            'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'  // Violet
          ][i % 6],
        };
      });
      
      setLeaveBalances(balances.length > 0 ? balances : []);
      if (!leaveForm.type && balances.length > 0) {
        setLeaveForm(prev => ({ ...prev, type: balances[0].id }));
      }
    } catch (err) {
      setError('Could not load leave data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedBal = leaveBalances.find(b => b.id === leaveForm.type);
      const start = new Date(leaveForm.fromDate);
      const end = new Date(leaveForm.toDate);
      const diffDays = isNaN(start) || isNaN(end) ? 1 : Math.max(1, Math.ceil((end - start) / 86400000) + 1);

      if (selectedBal && selectedBal.remaining < diffDays) {
         toast.error(`You only have ${selectedBal.remaining} days remaining for ${selectedBal.label}.`);
         setSubmitting(false);
         return;
      }

      const payload = {
        leaveTypeId: leaveForm.type,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        totalDays: diffDays,
        reason: leaveForm.reason,
      };
      
      const res = await axiosClient.post('/leaves', payload).catch(err => {
         throw err;
      });

      toast.success('Leave application submitted!');
      setOpenApplyModal(false);
      setLeaveForm({ type: leaveBalances[0]?.id || '', fromDate: '', toDate: '', reason: '' });
      fetchAll();
    } catch (err) {
      toast.error('Failed to submit leave. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const normalizeLeave = (r) => {
    const type = r.leaveType?.name || r.leaveType?.type || r.type || r.leave_type || 'Leave';
    const status = r.status?.charAt(0).toUpperCase() + r.status?.slice(1).toLowerCase() || 'Pending';
    const iconConf = LEAVE_ICON_MAP[type] || DEFAULT_ICON;
    const startDate = r.startDate || r.fromDate || r.from;
    const endDate = r.endDate || r.toDate || r.to;
    const reason = r.reason || r.sub || r.description || '—';

    const fmt = (d) => {
      if (!d) return '—';
      const dt = new Date(d);
      return isNaN(dt) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = isNaN(start) || isNaN(end) ? 1 : Math.max(1, Math.ceil((end - start) / 86400000) + 1);

    return {
      id: r._id || r.id,
      type,
      sub: reason,
      ...iconConf,
      from: fmt(startDate),
      to: fmt(endDate),
      days: diffDays === 1 ? '1 Day' : `${diffDays} Days`,
      status,
    };
  };

  const normalized = requests.map(normalizeLeave);
  const filtered = normalized.filter(r => tabFilter === 'All' || r.status === tabFilter);

  const totalReq = normalized.length;
  const pendingReq = normalized.filter(r => r.status === 'Pending').length;
  const approvedReq = normalized.filter(r => r.status === 'Approved').length;
  const rejectedReq = normalized.filter(r => r.status === 'Rejected').length;

  const kpiCards = [
    { label: 'Total Leaves', value: totalReq, sub: 'All requests', icon: DescriptionOutlinedIcon, iconBg: '#F3E8FF', iconColor: '#9333EA', border: '#9333EA' },
    { label: 'Pending', value: pendingReq, sub: 'Awaiting HR', icon: AccessTimeOutlinedIcon, iconBg: '#FEF3C7', iconColor: '#D97706', border: '#F59E0B' },
    { label: 'Approved', value: approvedReq, sub: 'Good to go!', icon: CheckCircleOutlinedIcon, iconBg: '#DCFCE7', iconColor: '#15803D', border: '#10B981' },
    { label: 'Rejected', value: rejectedReq, sub: 'Not approved', icon: CancelOutlinedIcon, iconBg: '#FEE2E2', iconColor: '#B91C1C', border: '#EF4444' },
  ];

  const modalTypeOptions = leaveBalances.length > 0
    ? leaveBalances.map(b => ({ value: b.id, label: `${b.label} (${b.remaining} available)` }))
    : [
        { value: 'Casual Leave', label: 'Casual Leave (12 available)' },
      ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 10 }}>
      {/* Premium Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: '2rem', background: 'linear-gradient(90deg, #1E293B 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            My Leave Center
          </Typography>
          <Typography sx={{ color: '#64748B', mt: 0.5, fontSize: '0.95rem', fontWeight: 500 }}>
            Manage your time off, track balances, and plan your holidays effortlessly.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAll} disabled={loading}
            sx={{ borderRadius: '12px', borderColor: 'rgba(226, 232, 240, 0.8)', color: '#475569', textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}>
            Refresh Data
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenApplyModal(true)}
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', fontWeight: 800, textTransform: 'none', px: 3, py: 1.2, boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
            Apply for Leave
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', '& .MuiAlert-message': { fontWeight: 600 } }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Leave Balances Highlights - Premium Cards */}
      <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.2rem', mb: 2 }}>Available Balances</Typography>
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2.5, mb: 4 }}>
          {[1,2,3].map(i => <Skeleton key={i} height={140} sx={{ borderRadius: '24px', transform: 'none' }} />)}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2.5, mb: 5 }}>
          {leaveBalances.map((lb, i) => {
            const usedPct = Math.min(100, ((lb.used / lb.total) * 100));
            return (
              <Paper key={i} elevation={0} sx={{ 
                background: lb.gradient,
                borderRadius: '24px', 
                p: 3, 
                color: '#FFFFFF',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                {/* Decorative background shapes */}
                <Box sx={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: -40, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.3px', mb: 0.5 }}>{lb.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Total Assigned: {lb.total} days</Typography>
                    </Box>
                    <Box sx={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AccountBalanceWalletIcon sx={{ color: '#FFF' }} />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                      <Typography sx={{ fontSize: '3rem', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-1px' }}>{lb.remaining}</Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9, pb: 0.5 }}>days left</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={usedPct} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF', borderRadius: 3 }
                      }} 
                    />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9, mt: 1, textAlign: 'right' }}>
                      {lb.used} days used
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
          {leaveBalances.length === 0 && (
            <GlassCard sx={{ p: 4, gridColumn: '1 / -1', textAlign: 'center' }}>
               <Typography sx={{ color: '#64748B', fontWeight: 600 }}>No leave policies assigned to you yet.</Typography>
            </GlassCard>
          )}
        </Box>
      )}

      {/* KPI Cards Row */}
      <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.2rem', mb: 2 }}>Request Overview</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4,1fr)' }, gap: 2.5, mb: 4 }}>
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <GlassCard key={i} sx={{ p: 2.5, borderTop: `4px solid ${card.border}`, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>{card.label}</Typography>
                  {loading ? <Skeleton width={60} height={40} /> : (
                    <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{card.value}</Typography>
                  )}
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, mt: 1 }}>{card.sub}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon sx={{ color: card.iconColor, fontSize: '1.4rem' }} />
                </Box>
              </Box>
            </GlassCard>
          );
        })}
      </Box>

      {/* Detailed History Table */}
      <GlassCard>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(226,232,240,0.8)', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>Request History</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3, fontWeight: 500 }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, background: 'rgba(241, 245, 249, 0.6)', p: 0.5, borderRadius: '12px' }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
              <Button key={t} size="small" onClick={() => setTabFilter(t)} disableElevation
                variant={tabFilter === t ? 'contained' : 'text'}
                sx={{ 
                  borderRadius: '10px', px: 2, py: 0.6, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none',
                  bgcolor: tabFilter === t ? '#FFFFFF' : 'transparent',
                  color: tabFilter === t ? '#0F172A' : '#64748B',
                  boxShadow: tabFilter === t ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { bgcolor: tabFilter === t ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }
                }}>
                {t}
              </Button>
            ))}
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Leave Type', 'Duration (Dates)', 'Total Days', 'Reason', 'Status', ''].map(h => (
                  <TableCell key={h} sx={{ py: 2, color: '#64748B', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', bgcolor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(226,232,240,0.8)' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6].map(j => <TableCell key={j}><Skeleton height={30} /></TableCell>)}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                    <CalendarMonthIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>No requests found in this category.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(r => {
                  const Icon = r.icon;
                  const sc = statusConfig[r.status] || statusConfig['Pending'];
                  return (
                    <TableRow key={r.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(226,232,240,0.5)', py: 2 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: r.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon sx={{ fontSize: '1.1rem', color: r.iconColor }} />
                          </Box>
                          <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem' }}>{r.type}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                          {r.from} <span style={{ color: '#94A3B8', fontWeight: 500, margin: '0 4px' }}>to</span> {r.to}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={r.days} size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 800, bgcolor: '#F1F5F9', color: '#334155', borderRadius: '6px' }} />
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.8rem', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                        {r.sub}
                      </TableCell>
                      <TableCell>
                        <Chip label={r.status} size="small" sx={{ height: 26, fontSize: '0.75rem', fontWeight: 800, bgcolor: sc.bgcolor, color: sc.color, px: 1 }} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: '#94A3B8' }}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      {/* Apply Leave Modal */}
      <Dialog open={openApplyModal} onClose={() => setOpenApplyModal(false)} maxWidth="md" fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            background: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
          } 
        }}>
        <DialogTitle sx={{ fontWeight: 900, p: 3, pb: 2, fontSize: '1.4rem', color: '#0F172A' }}>
          Apply for Time Off
          <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, mt: 0.5 }}>
            Select your leave type, dates, and provide a valid reason.
          </Typography>
        </DialogTitle>
        <form onSubmit={handleApplyLeave}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
              <TextField select label="Select Leave Policy" fullWidth size="medium"
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                InputProps={{ sx: { bgcolor: '#FFFFFF', borderRadius: '10px', fontWeight: 700 } }}>
                {modalTypeOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontWeight: 600 }}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="From Date" fullWidth InputLabelProps={{ shrink: true }}
                  value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} required
                  InputProps={{ sx: { borderRadius: '10px', bgcolor: '#FFFFFF' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="To Date" fullWidth InputLabelProps={{ shrink: true }}
                  value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })} required
                  InputProps={{ sx: { borderRadius: '10px', bgcolor: '#FFFFFF' } }} />
              </Grid>
            </Grid>

            <TextField multiline rows={4} label="Reason for Leave" fullWidth 
              placeholder="Please provide details about your absence..."
              value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }} />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, gap: 1.5, borderTop: '1px solid rgba(226,232,240,0.5)' }}>
            <Button onClick={() => setOpenApplyModal(false)} sx={{ fontWeight: 700, color: '#64748B', px: 3, py: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}
              sx={{ bgcolor: '#2563EB', fontWeight: 800, borderRadius: '12px', textTransform: 'none', px: 4, py: 1.2, boxShadow: '0 8px 20px -4px rgba(37,99,235,0.4)', fontSize: '0.95rem' }}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeeLeave;
