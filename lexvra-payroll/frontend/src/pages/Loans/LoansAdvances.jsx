import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const LoansAdvances = () => {
  const user = useSelector((state) => state.auth.user);
  const isEmployee = user?.role?.toUpperCase() === 'EMPLOYEE';

  const [search, setSearch] = useState('');
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [loanForm, setLeaveForm] = useState({
    type: 'Personal Loan',
    amount: '50000',
    tenure: '12',
    reason: 'Emergency requirement'
  });

  const [loans, setLoans] = useState([
    { id: 'LN-101', empId: 'LX001', name: 'Deepak Kumar', dept: 'Engineering', type: 'Personal Loan', amount: 150000, outstanding: 75000, emi: 5000, status: 'Active' },
    { id: 'LN-102', empId: 'LX002', name: 'Rahul Sharma', dept: 'Design', type: 'Festival Advance', amount: 25000, outstanding: 5000, emi: 2500, status: 'Active' },
    { id: 'LN-103', empId: 'LX003', name: 'Anjali Verma', dept: 'HR', type: 'Home Loan', amount: 500000, outstanding: 320000, emi: 15000, status: 'Active' },
    { id: 'LN-104', empId: 'LX004', name: 'Vikram Singh', dept: 'Finance', type: 'Emergency Advance', amount: 15000, outstanding: 0, emi: 0, status: 'Approved' },
  ]);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const newLoan = {
      id: `LN-${Date.now()}`,
      empId: user?.employeeRef?.employeeId || 'LX001',
      name: user?.name || 'Deepak Kumar',
      dept: user?.employeeRef?.department?.name || 'IT Department',
      type: loanForm.type,
      amount: Number(loanForm.amount) || 50000,
      outstanding: Number(loanForm.amount) || 50000,
      emi: Math.round((Number(loanForm.amount) || 50000) / (Number(loanForm.tenure) || 12)),
      status: 'Pending'
    };
    setLoans([newLoan, ...loans]);
    toast.success('Loan application submitted successfully!');
    setOpenApplyModal(false);
  };

  const filteredLoans = loans.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.empId.toLowerCase().includes(search.toLowerCase()) ||
    l.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
            Loans & Advances 🏦
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.2 }}>
            Manage employee loan requests, active advances, and monthly EMI deductions
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenApplyModal(true)}
          sx={{ borderRadius: '10px', bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', px: 2.5, py: 1 }}
        >
          + New Loan Request
        </Button>
      </Box>

      {/* Top 4 Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <StatCard title="Total Loans Disbursed" value="₹ 6,90,000" trend="up" trendValue="12.5% vs last year" icon={AccountBalanceOutlinedIcon} iconBg="#F3E8FF" iconColor="#8B5CF6" chartColor="#8B5CF6" sparklineData={[{ v: 40 }, { v: 50 }, { v: 69 }]} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard title="Total Outstanding" value="₹ 4,00,000" trend="neutral" trendValue="Active Balances" icon={CreditCardOutlinedIcon} iconBg="#FEF3C7" iconColor="#F59E0B" chartColor="#F59E0B" sparklineData={[{ v: 30 }, { v: 40 }, { v: 40 }]} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard title="Monthly EMI Deductions" value="₹ 22,500" trend="up" trendValue="Salary Deductions" icon={AccountBalanceWalletOutlinedIcon} iconBg="#DCFCE7" iconColor="#10B981" chartColor="#10B981" sparklineData={[{ v: 20 }, { v: 22 }, { v: 22.5 }]} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard title="Active Borrowers" value={String(loans.length)} trend="neutral" trendValue="Employees" icon={PeopleOutlinedIcon} iconBg="#EFF6FF" iconColor="#2563EB" chartColor="#2563EB" sparklineData={[{ v: 3 }, { v: 4 }, { v: 4 }]} />
        </Grid>
      </Grid>

      {/* Main Table Paper */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
            Active Loans & Advances
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search by name, ID or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment>,
                sx: { borderRadius: '10px', bgcolor: '#F8FAFC', minWidth: 260 }
              }}
            />

            <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={() => toast.success('Loans report exported!')} sx={{ borderRadius: '10px', color: '#475569', borderColor: '#CBD5E1', textTransform: 'none', fontWeight: 800 }}>
              Export
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Loan ID</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Sanctioned</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Outstanding</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Monthly EMI</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLoans.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.8rem' }}>
                    {row.name} <span style={{ fontSize: '0.675rem', color: '#94A3B8', display: 'block' }}>({row.empId})</span>
                  </TableCell>
                  <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>{row.dept}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.8rem' }}>{row.type}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.8rem' }}>₹ {Number(row.amount).toLocaleString('en-IN')}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#B91C1C', fontSize: '0.8rem' }}>₹ {Number(row.outstanding).toLocaleString('en-IN')}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#15803D', fontSize: '0.8rem' }}>₹ {Number(row.emi).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell textAlign="center">
                    <Button size="small" onClick={() => setSelectedLoan(row)} sx={{ color: '#2563EB', fontWeight: 800, fontSize: '0.725rem', textTransform: 'none' }}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Apply Loan Modal */}
      <Dialog open={openApplyModal} onClose={() => setOpenApplyModal(false)} maxWidth="xs" fullWidth paperProps={{ style: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, borderBottom: '1px solid #F1F5F9' }}>
          Apply For Loan / Advance
        </DialogTitle>
        <form onSubmit={handleApplySubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.4 }}>Category *</Typography>
              <Select value={loanForm.type} onChange={(e) => setLeaveForm({ ...loanForm, type: e.target.value })}>
                <MenuItem value="Personal Loan">Personal Loan (10% Interest)</MenuItem>
                <MenuItem value="Festival Advance">Festival Advance (0% Interest)</MenuItem>
                <MenuItem value="Home Loan">Home Loan (8.5% Interest)</MenuItem>
                <MenuItem value="Emergency Advance">Emergency Advance (0% Interest)</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.4, display: 'block' }}>Loan Amount (₹) *</Typography>
              <TextField fullWidth size="small" type="number" value={loanForm.amount} onChange={(e) => setLeaveForm({ ...loanForm, amount: e.target.value })} required />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.4, display: 'block' }}>Tenure (Months) *</Typography>
              <TextField fullWidth size="small" type="number" value={loanForm.tenure} onChange={(e) => setLeaveForm({ ...loanForm, tenure: e.target.value })} required />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.4, display: 'block' }}>Reason / Purpose *</Typography>
              <TextField fullWidth multiline rows={2} size="small" value={loanForm.reason} onChange={(e) => setLeaveForm({ ...loanForm, reason: e.target.value })} required />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenApplyModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>Submit Loan Application</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Loan Details Modal */}
      <Dialog open={Boolean(selectedLoan)} onClose={() => setSelectedLoan(null)} maxWidth="xs" fullWidth paperProps={{ style: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, borderBottom: '1px solid #F1F5F9' }}>
          Loan Details ({selectedLoan?.id})
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2">Employee: <strong>{selectedLoan?.name} ({selectedLoan?.empId})</strong></Typography>
          <Typography variant="subtitle2">Department: <strong>{selectedLoan?.dept}</strong></Typography>
          <Typography variant="subtitle2">Category: <strong>{selectedLoan?.type}</strong></Typography>
          <Typography variant="subtitle2">Sanctioned Amount: <strong>₹ {Number(selectedLoan?.amount || 0).toLocaleString('en-IN')}</strong></Typography>
          <Typography variant="subtitle2">Outstanding Balance: <strong>₹ {Number(selectedLoan?.outstanding || 0).toLocaleString('en-IN')}</strong></Typography>
          <Typography variant="subtitle2">Monthly EMI: <strong>₹ {Number(selectedLoan?.emi || 0).toLocaleString('en-IN')}</strong></Typography>
          <Typography variant="subtitle2">Status: <strong>{selectedLoan?.status}</strong></Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedLoan(null)} variant="contained" sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoansAdvances;
