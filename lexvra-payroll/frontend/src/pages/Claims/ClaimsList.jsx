import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Tab, Tabs, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, IconButton, Avatar, Skeleton, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { useSelector } from 'react-redux';

const ClaimsList = () => {
  const [tab, setTab] = useState(0);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const reduxUser = useSelector((state) => state.auth.user);
  const isAdmin = reduxUser?.role === 'ADMIN' || reduxUser?.role === 'HR' || reduxUser?.role === 'SUPER_ADMIN';

  // Add Expense Modal
  const [openModal, setOpenModal] = useState(false);
  const [category, setCategory] = useState('Bus Ticket');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal
  const [viewClaim, setViewClaim] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/claims');
      const data = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
      setClaims(data);
    } catch (err) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptFile(reader.result); // Base64 string for image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    // Mandatory receipt check for Bus Ticket & Food Bill!
    if ((category === 'Bus Ticket' || category === 'Food Bill') && !receiptFile) {
      toast.error(`Receipt photo is mandatory for ${category} reimbursements!`);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Remarks/Description is required');
      return;
    }

    setSubmitting(true);
    try {
      await axiosClient.post('/claims', {
        category,
        amount: parseFloat(amount),
        date: expenseDate,
        description: description.trim(),
        receiptUrl: receiptFile || ''
      });

      toast.success('Reimbursement claim submitted successfully!');
      setOpenModal(false);
      setAmount('');
      setDescription('');
      setReceiptFile(null);
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reimbursement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      await axiosClient.put(`/claims/${claimId}/status`, { status: newStatus });
      toast.success(`Claim ${newStatus.toLowerCase()} successfully!`);
      fetchClaims();
      setViewClaim(null);
    } catch (err) {
      toast.error('Failed to update claim status');
    }
  };

  const filteredClaims = claims.filter(c => {
    if (tab === 1) return c.status === 'PENDING';
    if (tab === 2) return c.status === 'APPROVED';
    if (tab === 3) return c.status === 'REJECTED';
    return true;
  });

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Title & Add Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            Reimbursements & Expense Claims
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Manage employee expense receipts, bus tickets, food bills & travel conveyance
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#4F46E5', color: '#FFF', borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, py: 1.2, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', '&:hover': { bgcolor: '#4338CA' } }}
        >
          Add Expense Claim
        </Button>
      </Box>

      {/* Main Table Card */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#F1F5F9', mb: 3 }}>
          <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'none' } }}>
            <Tab label={`All Requests (${claims.length})`} />
            <Tab label={`Pending (${claims.filter(c => c.status === 'PENDING').length})`} />
            <Tab label={`Approved (${claims.filter(c => c.status === 'APPROVED').length})`} />
            <Tab label={`Rejected (${claims.filter(c => c.status === 'REJECTED').length})`} />
          </Tabs>
        </Box>

        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>RECEIPT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}><Skeleton height={40} /></TableCell>
                  </TableRow>
                ))
              ) : filteredClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <ReceiptLongIcon sx={{ fontSize: '2.5rem', opacity: 0.5, mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: '#475569' }}>No reimbursement claims found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClaims.map((row) => {
                  const emp = row.employee || {};
                  return (
                    <TableRow key={row._id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={emp.avatar} sx={{ width: 36, height: 36, bgcolor: '#4F46E5', fontWeight: 800, fontSize: '0.85rem' }}>
                            {(emp.firstName || 'E').charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                              {emp.firstName} {emp.lastName}
                            </Typography>
                            <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>
                              {emp.employeeId || 'LX001'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip label={row.category} size="small" sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '8px' }} />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 900, color: '#0F172A', fontSize: '0.95rem' }}>
                        ₹{row.amount}
                      </TableCell>

                      <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.82rem' }}>
                        {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>

                      <TableCell>
                        {row.receiptUrl ? (
                          <Chip icon={<AttachFileIcon sx={{ fontSize: '0.9rem !important' }} />} label="Attached" size="small" color="success" variant="outlined" sx={{ fontWeight: 800 }} />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>No Receipt</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            bgcolor: row.status === 'APPROVED' ? '#DCFCE7' : row.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                            color: row.status === 'APPROVED' ? '#15803D' : row.status === 'REJECTED' ? '#B91C1C' : '#D97706',
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IconButton size="small" onClick={() => setViewClaim(row)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <VisibilityIcon sx={{ fontSize: '1rem', color: '#475569' }} />
                          </IconButton>

                          {isAdmin && row.status === 'PENDING' && (
                            <>
                              <Button size="small" variant="contained" onClick={() => handleUpdateStatus(row._id, 'APPROVED')} sx={{ bgcolor: '#10B981', color: '#FFF', fontWeight: 800, borderRadius: '8px', textTransform: 'none', px: 1.5 }}>
                                Approve
                              </Button>
                              <Button size="small" variant="contained" onClick={() => handleUpdateStatus(row._id, 'REJECTED')} sx={{ bgcolor: '#EF4444', color: '#FFF', fontWeight: 800, borderRadius: '8px', textTransform: 'none', px: 1.5 }}>
                                Reject
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD EXPENSE CLAIM MODAL DIALOG */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          💸 Add Reimbursement Claim
        </DialogTitle>
        <form onSubmit={handleSubmitExpense}>
          <DialogContent sx={{ pt: 2.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Expense Category <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              >
                {['Bus Ticket', 'Food Bill', 'Local Conveyance', 'Hotel', 'Travel', 'Medical', 'Internet', 'Fuel', 'Other'].map(cat => (
                  <MenuItem key={cat} value={cat} sx={{ fontWeight: 600 }}>{cat}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 450"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Expense Date <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Bill / Receipt Attachment {(category === 'Bus Ticket' || category === 'Food Bill') ? <span style={{ color: '#EF4444' }}>* (Mandatory photo for {category})</span> : <span style={{ color: '#64748B' }}>(Optional for {category})</span>}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AttachFileIcon />}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 1.2, borderColor: '#CBD5E1', color: receiptFile ? '#10B981' : '#475569' }}
              >
                {receiptFile ? '✓ Bill Photo Uploaded' : 'Upload Receipt Photo'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {receiptFile && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img src={receiptFile} alt="Receipt preview" style={{ maxHeight: 120, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Remarks / Details <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                required
                placeholder="Enter details (e.g. Bus ticket from Mohali to Delhi for client meeting)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#4F46E5', color: '#FFF', fontWeight: 800, borderRadius: '10px', textTransform: 'none', px: 3 }}>
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* VIEW CLAIM DETAILS MODAL */}
      <Dialog open={Boolean(viewClaim)} onClose={() => setViewClaim(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          🧾 Claim Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          {viewClaim && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip label={viewClaim.category} sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB' }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  ₹{viewClaim.amount}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                REMARKS / DESCRIPTION
              </Typography>
              <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, mb: 2, bgcolor: '#F8FAFC', p: 1.5, borderRadius: '10px' }}>
                {viewClaim.description || 'No description provided'}
              </Typography>

              {viewClaim.receiptUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    ATTACHED BILL RECEIPT
                  </Typography>
                  <img src={viewClaim.receiptUrl} alt="Bill receipt" style={{ width: '100%', borderRadius: 12, border: '1px solid #E2E8F0' }} />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewClaim(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimsList;
