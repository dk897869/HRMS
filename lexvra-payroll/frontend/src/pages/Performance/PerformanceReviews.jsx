import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Rating, FormControlLabel,
  Switch, Chip, Skeleton, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const GlassCard = ({ children, sx }) => (
  <Paper elevation={0} sx={{
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    ...sx
  }}>
    {children}
  </Paper>
);

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [openEval, setOpenEval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    employee: '',
    reviewPeriod: 'July 2026',
    managerRating: 3,
    managerComments: '',
    rewards: '',
    isPerformerOfTheMonth: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, empRes] = await Promise.all([
        axiosClient.get('/performance').catch(() => ({ data: { data: [] }})),
        axiosClient.get('/employees').catch(() => ({ data: { data: [] }}))
      ]);
      setReviews(revRes.data?.data || revRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (err) {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        reviewer: employees[0]?._id, // Assume logged in admin is reviewer (should come from auth ideally)
        status: 'COMPLETED',
        finalRating: form.managerRating
      };
      
      if (editMode) {
        await axiosClient.put(`/performance/${editingId}`, payload);
        toast.success('Evaluation updated successfully!');
      } else {
        await axiosClient.post('/performance', payload);
        toast.success('Evaluation submitted successfully!');
        if (form.isPerformerOfTheMonth) {
          toast.success('Certificate generated & sent to employee!');
        }
      }
      
      handleCloseEval();
      fetchData();
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setForm({
      employee: review.employee?._id || '',
      reviewPeriod: review.reviewPeriod || 'July 2026',
      managerRating: review.finalRating || 3,
      managerComments: review.managerComments || '',
      rewards: review.rewards || '',
      isPerformerOfTheMonth: review.isPerformerOfTheMonth || false
    });
    setEditingId(review._id);
    setEditMode(true);
    setOpenEval(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evaluation?')) return;
    try {
      await axiosClient.delete(`/performance/${id}`);
      toast.success('Evaluation deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete evaluation');
    }
  };

  const handleCloseEval = () => {
    setOpenEval(false);
    setEditMode(false);
    setEditingId(null);
    setForm({
      employee: '', reviewPeriod: 'July 2026', managerRating: 3, managerComments: '', rewards: '', isPerformerOfTheMonth: false
    });
  };

  const filtered = reviews.filter(r => r.employee?.firstName?.toLowerCase().includes(search.toLowerCase()) || r.reviewPeriod?.toLowerCase().includes(search.toLowerCase()));

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + (r.finalRating || 0), 0) / reviews.length).toFixed(1) : 0;
  const topPerformers = reviews.filter(r => r.isPerformerOfTheMonth).length;

  return (
    <Box sx={{ p: 4, width: '100%', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>Performance & Rewards</Typography>
          <Typography sx={{ color: '#64748B', mt: 0.5 }}>Evaluate staff, distribute rewards, and generate certificates.</Typography>
        </Box>
        <Button variant="contained" startIcon={<EmojiEventsIcon />} onClick={() => { handleCloseEval(); setOpenEval(true); }}
          sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: '14px', px: 3, py: 1.5, fontWeight: 800, textTransform: 'none', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)' }}>
          New Evaluation
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StarIcon sx={{ fontSize: '2rem' }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Avg Company Rating</Typography>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{avgRating}</Typography>
            </Box>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: '#FCE7F3', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WorkspacePremiumIcon sx={{ fontSize: '2rem' }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Certificates</Typography>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{topPerformers}</Typography>
            </Box>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CelebrationIcon sx={{ fontSize: '2rem' }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Evaluations</Typography>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{reviews.length}</Typography>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>Recent Evaluations</Typography>
          <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, sx: { borderRadius: '12px', bgcolor: '#F1F5F9' } }} />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Rewards & Recognition</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? [...Array(4)].map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton height={40}/></TableCell></TableRow>)
              : filtered.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94A3B8' }}>No evaluations found</TableCell></TableRow>
              : filtered.map(r => (
                <TableRow key={r._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#3B82F6', fontWeight: 800 }}>{r.employee?.firstName?.charAt(0)}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{r.employee?.firstName} {r.employee?.lastName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{r.employee?.employeeId}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={r.reviewPeriod} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#334155' }} /></TableCell>
                  <TableCell><Rating value={r.finalRating} readOnly size="small" sx={{ color: '#F59E0B' }} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {r.isPerformerOfTheMonth && <Chip icon={<WorkspacePremiumIcon />} label="Top Performer" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 800 }} />}
                      {r.rewards && <Chip icon={<CelebrationIcon />} label={r.rewards} size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800 }} />}
                      {!r.isPerformerOfTheMonth && !r.rewards && <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', fontStyle: 'italic' }}>None</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(r)} sx={{ color: '#3B82F6', mr: 1, bgcolor: '#EFF6FF' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(r._id)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <Dialog open={openEval} onClose={handleCloseEval} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0F172A', p: 3, pb: 1 }}>
          {editMode ? 'Edit Performance Evaluation' : 'Evaluate Performance'}
        </DialogTitle>
        <form onSubmit={handleEvaluate}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField select label="Select Employee" required fullWidth value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}
              InputProps={{ sx: { borderRadius: '12px' } }}>
              {employees.map(emp => <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</MenuItem>)}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              <TextField label="Review Period" required value={form.reviewPeriod} onChange={e => setForm({...form, reviewPeriod: e.target.value})}
                sx={{ flex: 1 }} InputProps={{ sx: { borderRadius: '12px' } }} />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', mb: 0.5 }}>RATING OUT OF 5</Typography>
                <Rating value={form.managerRating} onChange={(e, v) => setForm({...form, managerRating: v})} size="large" sx={{ color: '#F59E0B' }} />
              </Box>
            </Box>

            <TextField multiline rows={3} label="Congratulatory / Constructive Comments" value={form.managerComments} onChange={e => setForm({...form, managerComments: e.target.value})}
              InputProps={{ sx: { borderRadius: '12px' } }} placeholder="Great work this month..." />

            <TextField label="Rewards (Optional)" value={form.rewards} onChange={e => setForm({...form, rewards: e.target.value})}
              InputProps={{ sx: { borderRadius: '12px' } }} placeholder="e.g. Amazon Gift Card ₹1000" />

            <Box sx={{ p: 2, borderRadius: '16px', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#B45309' }}>Performer of the Month</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 500 }}>Will generate a PDF Certificate and notify the employee.</Typography>
              </Box>
              <Switch checked={form.isPerformerOfTheMonth} onChange={e => setForm({...form, isPerformerOfTheMonth: e.target.checked})} color="warning" />
            </Box>

          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={handleCloseEval} sx={{ fontWeight: 700, color: '#64748B' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#0F172A', color: '#FFF', borderRadius: '12px', px: 4, fontWeight: 800 }}>
              {submitting ? 'Processing...' : (editMode ? 'Update Evaluation' : 'Submit Evaluation')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </Box>
  );
};

export default PerformanceReviews;
