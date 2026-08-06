import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tooltip,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

const ApprovalRequests = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real dynamic requests
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedReq, setSelectedReq] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'view'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leavesRes, approvalsRes, claimsRes] = await Promise.all([
        axiosClient.get('/leaves').catch(() => null),
        axiosClient.get('/approvals').catch(() => null),
        axiosClient.get('/claims').catch(() => null)
      ]);

      const leaves = Array.isArray(leavesRes) ? leavesRes : (leavesRes?.data || leavesRes?.leaves || []);
      const approvals = approvalsRes?.data || approvalsRes?.data?.data || approvalsRes || [];
      const claimsRaw = Array.isArray(claimsRes) ? claimsRes : (claimsRes?.data?.data || claimsRes?.data || []);

      // Map leaves
      const formattedLeaves = leaves.map(L => {
        const emp = L.employee || {};
        const typeName = L.leaveType?.name || L.leaveType?.type || 'Leave';
        const start = new Date(L.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        
        return {
          id: L._id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          empId: emp.employeeId || 'LX001',
          dept: emp.department?.name || emp.department || 'Engineering',
          type: 'Leave Request',
          subType: `${typeName} (${L.totalDays} Days)`,
          reason: L.reason || 'No reason provided',
          date: start,
          status: L.status?.charAt(0).toUpperCase() + L.status?.slice(1).toLowerCase() || 'Pending',
          avatar: emp.avatar || '',
          originalData: L
        };
      });

      // Map Approval documents
      const formattedApprovals = (Array.isArray(approvals) ? approvals : [])
        .filter(A => A.requestType !== 'Expense Claim')
        .map(A => {
        const emp = A.employee || {};
        const empCode = typeof emp === 'object' ? emp.employeeId || 'LX001' : 'LX001';
        const deptName = typeof emp === 'object' ? (emp.department?.name || emp.department || 'HR') : 'HR';
        return {
          id: A._id,
          name: A.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          empId: empCode,
          dept: deptName,
          type: A.requestType || 'Attendance Correction',
          subType: A.requestType,
          reason: A.purpose || 'No details',
          date: A.submittedOn || new Date(A.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: A.status || 'Pending',
          avatar: A.avatar || emp.avatar || '',
          originalData: A
        };
      });

      // Map expense claims from /claims API
      const formattedClaims = (Array.isArray(claimsRaw) ? claimsRaw : []).map(C => {
        const emp = C.employee || {};
        return {
          id: C._id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          empId: emp.employeeId || 'LX001',
          dept: emp.department?.name || emp.department || 'Engineering',
          type: 'Expense Claim',
          subType: C.category || 'Expense',
          reason: C.description || `${C.category} - ₹${C.amount}`,
          date: new Date(C.date || C.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: C.status?.charAt(0).toUpperCase() + C.status?.slice(1).toLowerCase() || 'Pending',
          avatar: emp.avatar || '',
          originalData: C
        };
      });

      setRequestsList([...formattedLeaves, ...formattedApprovals, ...formattedClaims]);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch approval requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (req, action) => {
    setSelectedReq(req);
    setModalType(action);
  };

  const confirmAction = async () => {
    setSubmitting(true);
    try {
      const isApprove = modalType === 'approve';
      
      if (selectedReq.type === 'Leave Request') {
        const newStatus = isApprove ? 'APPROVED' : 'REJECTED';
        await axiosClient.put(`/leaves/${selectedReq.id}/status`, {
          status: newStatus,
          rejectionReason: remarks
        });
      } else if (selectedReq.type === 'Expense Claim') {
        const newStatus = isApprove ? 'APPROVED' : 'REJECTED';
        await axiosClient.put(`/claims/${selectedReq.id}/status`, {
          status: newStatus
        });
      } else {
        const newStatus = isApprove ? 'Approved' : 'Rejected';
        await axiosClient.put(`/approvals/${selectedReq.id}/status`, {
          status: newStatus,
          managerRemarks: remarks
        });
      }
      
      toast.success(`${selectedReq.type} for ${selectedReq.name} ${isApprove ? 'Approved ✓' : 'Rejected ✗'}`);
      
      // Update local state directly
      setRequestsList(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: isApprove ? 'Approved' : 'Rejected' } : r));
      
      setModalType(null);
      setSelectedReq(null);
      setRemarks('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requestsList.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 1) return matchesSearch && r.type === 'Leave Request';
    if (activeTab === 2) return matchesSearch && (r.type === 'Attendance Correction' || r.type.includes('Attendance'));
    if (activeTab === 3) return matchesSearch && (r.type === 'Loan Request' || r.type.includes('Loan'));
    if (activeTab === 4) return matchesSearch && (r.type === 'Expense Claim' || r.type.includes('Expense'));
    return matchesSearch;
  });

  const pendingLeaves = requestsList.filter(r => r.type === 'Leave Request' && r.status === 'Pending').length;
  const pendingAttendance = requestsList.filter(r => (r.type === 'Attendance Correction' || r.type?.includes('Attendance')) && r.status === 'Pending').length;
  const pendingLoans = requestsList.filter(r => (r.type === 'Loan Request' || r.type?.includes('Loan')) && r.status === 'Pending').length;
  const pendingExpenses = requestsList.filter(r => (r.type === 'Expense Claim' || r.type?.includes('Expense')) && r.status === 'Pending').length;

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Title Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            Approval Requests Center
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Review, approve or reject leave, attendance correction, loan & expense requests
          </Typography>
        </Box>

        <Chip label={`Pending Approvals: ${requestsList.filter(r => r.status === 'Pending').length}`} color="primary" sx={{ fontWeight: 900, fontSize: '0.85rem', height: 32 }} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper elevation={0} onClick={() => setActiveTab(1)} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: activeTab === 1 ? '2px solid #EC4899' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Avatar sx={{ bgcolor: '#FCE7F3', color: '#EC4899', width: 46, height: 46 }}><EventAvailableIcon /></Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Leave Requests</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>{pendingLeaves} Pending</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Paper elevation={0} onClick={() => setActiveTab(2)} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: activeTab === 2 ? '2px solid #2563EB' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 46, height: 46 }}><AccessTimeIcon /></Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Attendance Corrections</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>{pendingAttendance} Pending</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Paper elevation={0} onClick={() => setActiveTab(3)} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: activeTab === 3 ? '2px solid #F59E0B' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Avatar sx={{ bgcolor: '#FEF3C7', color: '#F59E0B', width: 46, height: 46 }}><AccountBalanceIcon /></Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Loan & Advances</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>{pendingLoans} Pending</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Paper elevation={0} onClick={() => setActiveTab(4)} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: activeTab === 4 ? '2px solid #10B981' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Avatar sx={{ bgcolor: '#DCFCE7', color: '#10B981', width: 46, height: 46 }}><ReceiptLongIcon /></Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Expense Claims</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>{pendingExpenses} Pending</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        {/* Filters & Search Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 2 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'none' } }}>
            <Tab label="All Requests" />
            <Tab label="Leave Requests" />
            <Tab label="Attendance Corrections" />
            <Tab label="Loans & Advances" />
            <Tab label="Expense Claims" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search request or employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px', bgcolor: '#F8FAFC', minWidth: 260 }
            }}
          />
        </Box>

        {/* Requests Data Table */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Request Type</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Details & Reason</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Applied Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6].map(j => <TableCell key={j}><Skeleton height={30} /></TableCell>)}
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#94A3B8', fontWeight: 600 }}>
                    No pending requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={req.avatar} sx={{ width: 38, height: 38 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                            {req.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {req.empId} • {req.dept}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={req.type}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.725rem',
                          bgcolor: req.type === 'Leave Request' ? '#FCE7F3' : req.type === 'Loan & Advance' ? '#FEF3C7' : req.type === 'Attendance Correction' ? '#EFF6FF' : '#DCFCE7',
                          color: req.type === 'Leave Request' ? '#EC4899' : req.type === 'Loan & Advance' ? '#D97706' : req.type === 'Attendance Correction' ? '#2563EB' : '#10B981',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block' }}>
                        {req.subType}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', maxWidth: 200, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reason}>
                        "{req.reason}"
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                        {req.date}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          bgcolor: req.status === 'Approved' ? '#DCFCE7' : req.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: req.status === 'Approved' ? '#15803D' : req.status === 'Rejected' ? '#B91C1C' : '#D97706',
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleAction(req, 'view')}
                          sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { bgcolor: '#F1F5F9', color: '#2563EB' } }}
                          title="View Request Details"
                        >
                          <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>

                        {req.status === 'Pending' ? (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                              onClick={() => handleAction(req, 'approve')}
                              sx={{ bgcolor: '#10B981', color: '#FFF', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.7, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', '&:hover': { bgcolor: '#059669' } }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CancelIcon sx={{ fontSize: '1rem !important' }} />}
                              onClick={() => handleAction(req, 'reject')}
                              sx={{ bgcolor: '#EF4444', color: '#FFF', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.7, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)', '&:hover': { bgcolor: '#DC2626' } }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                            Decided
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation & View Details Modal */}
      <Dialog open={Boolean(modalType)} onClose={() => !submitting && setModalType(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        {modalType === 'view' ? (
          <>
            <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
              📋 Request Full Details
            </DialogTitle>
            <DialogContent sx={{ pt: 2.5, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Avatar src={selectedReq?.avatar} sx={{ width: 50, height: 50, bgcolor: '#2563EB', fontWeight: 800 }}>
                  {selectedReq?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                    {selectedReq?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    {selectedReq?.empId} • {selectedReq?.dept}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  REQUEST TYPE
                </Typography>
                <Chip label={selectedReq?.type} size="small" sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '8px', mb: 1.5 }} />

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  FULL DETAILS & REASON
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'pre-line' }}>
                  {selectedReq?.reason}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  Applied On: {selectedReq?.date}
                </Typography>
                <Chip label={selectedReq?.status} size="small" sx={{ fontWeight: 900, bgcolor: selectedReq?.status === 'Approved' ? '#DCFCE7' : selectedReq?.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', color: selectedReq?.status === 'Approved' ? '#15803D' : selectedReq?.status === 'Rejected' ? '#B91C1C' : '#D97706' }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
              <Button onClick={() => setModalType(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
                Close
              </Button>
              {selectedReq?.status === 'Pending' && (
                <>
                  <Button variant="contained" onClick={() => setModalType('approve')} sx={{ bgcolor: '#10B981', color: '#FFF', fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}>
                    Approve
                  </Button>
                  <Button variant="contained" onClick={() => setModalType('reject')} sx={{ bgcolor: '#EF4444', color: '#FFF', fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}>
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {modalType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2">
                Are you sure you want to {modalType} the <strong>{selectedReq?.type}</strong> for <strong>{selectedReq?.name}</strong>?
              </Typography>
              <TextField fullWidth multiline rows={2} label="Manager Remarks (Optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={submitting} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setModalType(null)} disabled={submitting}>Cancel</Button>
              <Button variant="contained" color={modalType === 'approve' ? 'success' : 'error'} onClick={confirmAction} disabled={submitting}>
                {submitting ? 'Processing...' : `Confirm ${modalType === 'approve' ? 'Approve' : 'Reject'}`}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ApprovalRequests;
