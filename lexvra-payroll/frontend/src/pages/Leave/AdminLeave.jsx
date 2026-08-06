import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Avatar, Chip, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Tabs, Tab, Dialog, DialogContent,
  Tooltip, Drawer, InputAdornment, FormControlLabel, Switch, RadioGroup, Radio, FormControl, FormLabel
} from '@mui/material';

// Icons
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';

// Dashboard Icons
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

// --- Premium UI Components ---

const GlassCard = ({ children, sx }) => (
  <Paper elevation={0} sx={{
    bgcolor: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0px 10px 30px rgba(112, 144, 176, 0.08)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0px 15px 35px rgba(112, 144, 176, 0.12)',
    },
    ...sx
  }}>
    {children}
  </Paper>
);

const KPIWidget = ({ title, value, subtitle, icon: Icon, color }) => (
  <GlassCard sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
    <Box sx={{
      width: 56, height: 56, borderRadius: '18px',
      background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color
    }}>
      <Icon sx={{ fontSize: '1.8rem' }} />
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 500, mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
    </Box>
  </GlassCard>
);

const BeautifulDoughnut = ({ data, total }) => {
  let currentAngle = 0;
  const gradientStops = data.map((item, index) => {
    if (total === 0) return `${item.color} 0deg 360deg`;
    const angle = (item.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle = end;
    return `${item.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <Box sx={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{
        position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
        background: total > 0 ? `conic-gradient(${gradientStops})` : '#E2E8F0',
        transition: 'all 0.5s ease', boxShadow: '0px 10px 20px rgba(0,0,0,0.05)'
      }} />
      <Box sx={{
        position: 'absolute', width: '75%', height: '75%', borderRadius: '50%', bgcolor: '#FFFFFF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0px 4px 10px rgba(0,0,0,0.03)'
      }}>
        <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: 1 }}>TOTAL</Typography>
        <Typography variant="h3" sx={{ color: '#1B254B', fontWeight: 900, lineHeight: 1, my: 0.5 }}>{total}</Typography>
        <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>Leaves</Typography>
      </Box>
    </Box>
  );
};

// --- Main Page Component ---

const AdminLeave = () => {
  const [tabValue, setTabValue] = useState(0); // 0: Dashboard, 1: Assign & Balances
  
  // Data States
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  
  // Modals States
  const [selectedRecord, setSelectedRecord] = useState(null); // Leave Request Details Drawer
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openBalanceModal, setOpenBalanceModal] = useState(false);
  
  // Form States
  const [policyForm, setPolicyForm] = useState({ name: '', code: 'CL', daysPerYear: 12, carryForward: 'false', frequency: 'Yearly' });
  const [assignForm, setAssignForm] = useState({ employeeId: '', leaveTypeId: '', initialBalance: 0 });
  const [selectedEmpForBalance, setSelectedEmpForBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesRes, empsRes, typesRes, balRes] = await Promise.all([
        axiosClient.get('/leaves').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/employees').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/leaves/types').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/leaves/balances').catch(() => ({ data: { data: [] } }))
      ]);

      setLeaves(leavesRes.data.leaves || leavesRes.data.data || leavesRes.data || []);
      setEmployees(empsRes.data.employees || empsRes.data.data || empsRes.data || []);
      setLeaveTypes(typesRes.data.types || typesRes.data.data || typesRes.data || []);
      setBalances(balRes.data.balances || balRes.data.data || balRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const payload = { ...policyForm, carryForward: policyForm.carryForward === 'true' };
      const res = await axiosClient.post('/leaves/types', payload);
      if (res.success) {
        toast.success('Leave Policy Created!');
        setOpenCreateModal(false);
        fetchData();
        setTabValue(1); // Auto-redirect to Assign tab
      }
    } catch (err) {
      toast.error('Failed to create policy');
    }
  };

  const handleAssignLeave = async () => {
    try {
      const parsedBalance = (assignForm.initialBalance === undefined || assignForm.initialBalance === '') ? 0 : Number(assignForm.initialBalance);
      const res = await axiosClient.post('/leaves/assign', {
        employeeId: assignForm.employeeId,
        leaveTypeId: assignForm.leaveTypeId,
        balance: parsedBalance
      });
      if (res.success) {
        toast.success('Leave Assigned!');
        setOpenAssignModal(false);
        await fetchData();
        // Automatically open the update balance modal for that employee
        const emp = employees.find(e => e._id === assignForm.employeeId);
        if (emp) openEmployeeBalanceModal(emp);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign leave. Maybe already assigned?');
    }
  };

  const openEmployeeBalanceModal = (emp) => {
    setSelectedEmpForBalance(emp);
    const empBalances = balances.filter(b => b.employee?._id === emp._id);
    const formInit = {};
    empBalances.forEach(b => {
      formInit[b.leaveType?._id] = b.balance;
    });
    setBalanceForm(formInit);
    setOpenBalanceModal(true);
  };

  const handleUpdateBalance = async (leaveTypeId) => {
    try {
      const newBal = balanceForm[leaveTypeId];
      const parsedBalance = (newBal === undefined || newBal === '') ? 0 : Number(newBal);
      
      const res = await axiosClient.put('/leaves/balance', {
        employeeId: selectedEmpForBalance._id,
        leaveTypeId,
        balance: parsedBalance
      });
      if (res.success) {
        toast.success('Balance Updated!');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update balance');
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      await axiosClient.put(`/leaves/${id}/status`, { status, rejectionReason: 'Admin Decision' });
      toast.success(`Leave ${status}!`);
      setSelectedRecord(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // KPI Calculations
  const pendingLeaves = leaves.filter(l => l.status?.toUpperCase() === 'PENDING').length;
  const approvedLeaves = leaves.filter(l => l.status?.toUpperCase() === 'APPROVED').length;
  const rejectedLeaves = leaves.filter(l => l.status?.toUpperCase() === 'REJECTED').length;

  const distributionData = [
    { name: 'Casual Leave', value: leaves.filter(l => l.leaveType?.name?.toUpperCase().includes('CASUAL') || l.leaveType?.code === 'CL').length || 2, color: '#4318FF' },
    { name: 'Sick Leave', value: leaves.filter(l => l.leaveType?.name?.toUpperCase().includes('SICK') || l.leaveType?.code === 'SL').length || 1, color: '#05CD99' },
    { name: 'Earned/Privilege', value: leaves.filter(l => l.leaveType?.name?.toUpperCase().includes('EARNED') || l.leaveType?.code === 'PL').length || 3, color: '#FFCE20' },
  ].filter(d => d.value > 0);
  
  const totalChartRequests = distributionData.reduce((acc, curr) => acc + curr.value, 0);

  const getStatusChip = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    const config = {
      APPROVED: { bg: '#E2FFE9', color: '#01B574', label: 'Approved' },
      PENDING: { bg: '#FFF5D8', color: '#FFB547', label: 'Pending' },
      REJECTED: { bg: '#FFE2E5', color: '#E31A1A', label: 'Rejected' },
    };
    const c = config[s] || config.PENDING;
    return <Chip label={c.label} sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, borderRadius: '8px', px: 1, height: 26, fontSize: '0.75rem' }} />;
  };

  const getTypeChip = (typeObj) => {
    const t = typeObj?.name?.toUpperCase() || typeObj?.code?.toUpperCase() || '';
    let color = '#4318FF'; let bg = '#F4F7FE';
    if (t.includes('SICK') || t === 'SL') { color = '#01B574'; bg = '#E2FFE9'; }
    else if (t.includes('EARNED') || t === 'PL') { color = '#FFB547'; bg = '#FFF5D8'; }
    else if (t.includes('COMP')) { color = '#E31A1A'; bg = '#FFE2E5'; }
    else if (t.includes('CASUAL') || t === 'CL') { color = '#4318FF'; bg = '#E9EDF7'; }
    return <Chip label={typeObj?.name || typeObj?.code || 'Leave'} sx={{ bgcolor: bg, color: color, fontWeight: 700, borderRadius: '8px', height: 26, fontSize: '0.75rem' }} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F4F7FE', p: { xs: 2, md: 4 } }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#1B254B', fontWeight: 900, mb: 0.5, letterSpacing: '-0.5px' }}>
            Leave Center
          </Typography>
          <Typography variant="body1" sx={{ color: '#A3AED0', fontWeight: 500 }}>
            Manage employee leaves, track balances, and approve requests seamlessly.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => setOpenCreateModal(true)} startIcon={<AddIcon />} sx={{
            bgcolor: '#4318FF', color: '#fff', fontWeight: 700, px: 3, py: 1.5, borderRadius: '16px',
            textTransform: 'none', boxShadow: '0px 10px 20px rgba(67, 24, 255, 0.2)',
            '&:hover': { bgcolor: '#3311CC', boxShadow: '0px 15px 25px rgba(67, 24, 255, 0.3)' }
          }}>
            Create Leave Policy
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '1rem' } }}>
          <Tab label="Dashboard & Requests" />
          <Tab label="Assign Leaves & Balances" />
        </Tabs>
      </Box>

      {/* --- TAB 0: DASHBOARD & REQUESTS --- */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={4} xl={2}><KPIWidget title="Total Employees" value={employees.length} color="#4318FF" icon={PeopleAltOutlinedIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={4} xl={2}><KPIWidget title="Today on Leave" value={0} color="#FFCE20" icon={CalendarTodayOutlinedIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={4} xl={2}><KPIWidget title="Pending Requests" value={pendingLeaves} color="#FFB547" icon={PendingActionsOutlinedIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={4} xl={2}><KPIWidget title="Approved (MTD)" value={approvedLeaves} color="#05CD99" icon={CheckCircleOutlineOutlinedIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={4} xl={2}><KPIWidget title="Rejected (MTD)" value={rejectedLeaves} color="#EE5D50" icon={CancelOutlinedIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={4} xl={2}><KPIWidget title="Active Policies" value={leaveTypes.length} color="#4318FF" icon={FactCheckOutlinedIcon} /></Grid>
          </Grid>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <GlassCard sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800 }}>Leave Distribution</Typography>
                  <Chip label="This Month" sx={{ bgcolor: '#F4F7FE', color: '#4318FF', fontWeight: 700, borderRadius: '10px' }} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, flexGrow: 1 }}>
                  <BeautifulDoughnut data={distributionData} total={totalChartRequests} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 200 }}>
                    {distributionData.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color, boxShadow: `0 0 10px ${item.color}88` }} />
                          <Typography variant="body1" sx={{ color: '#A3AED0', fontWeight: 600 }}>{item.name}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800, lineHeight: 1 }}>{item.value}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </GlassCard>
            </Grid>

            <Grid item xs={12} lg={6}>
              <GlassCard sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800 }}>Upcoming Leaves</Typography>
                  <Button variant="text" sx={{ color: '#4318FF', fontWeight: 700, textTransform: 'none' }}>View Calendar</Button>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {leaves.slice(0, 3).map((l, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '16px', bgcolor: '#F4F7FE' }}>
                      <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: '12px', textAlign: 'center', minWidth: 60 }}>
                        <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                          {new Date(l.fromDate).toLocaleDateString('en-US', { month: 'short' })}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#4318FF', fontWeight: 900, lineHeight: 1 }}>
                          {new Date(l.fromDate).getDate()}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#1B254B', fontWeight: 700 }}>
                          {l.employee?.firstName} {l.employee?.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 500 }}>
                          {l.leaveType?.name || 'Leave'} • {l.totalDays || 1} Days
                        </Typography>
                      </Box>
                      {getStatusChip(l.status)}
                    </Box>
                  ))}
                  {leaves.length === 0 && (
                    <Typography sx={{ color: '#A3AED0', fontWeight: 600, textAlign: 'center', mt: 5 }}>No upcoming leaves.</Typography>
                  )}
                </Box>
              </GlassCard>
            </Grid>
          </Grid>

          <GlassCard sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800 }}>Leave Requests Directory</Typography>
            </Box>
            <TableContainer sx={{ borderRadius: '16px', border: '1px solid #F4F7FE' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F4F7FE' }}>
                  <TableRow>
                    {['EMPLOYEE', 'TYPE', 'DURATION', 'DAYS', 'STATUS', 'ACTIONS'].map(th => (
                      <TableCell key={th} sx={{ color: '#A3AED0', fontWeight: 700, fontSize: '0.75rem', py: 2 }}>{th}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.length === 0 ? (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>No requests found.</TableCell></TableRow>
                  ) : leaves.map((rec) => (
                    <TableRow key={rec._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#4318FF' }}>{rec.employee?.firstName?.charAt(0) || 'U'}</Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rec.employee?.firstName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getTypeChip(rec.leaveType)}</TableCell>
                      <TableCell>{formatDate(rec.fromDate)} to {formatDate(rec.toDate)}</TableCell>
                      <TableCell><b>{rec.totalDays || 1}</b></TableCell>
                      <TableCell>{getStatusChip(rec.status)}</TableCell>
                      <TableCell>
                         <IconButton onClick={() => setSelectedRecord(rec)} sx={{ color: '#4318FF' }}><VisibilityOutlinedIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Box>
      )}

      {/* --- TAB 1: ASSIGN LEAVES & BALANCES --- */}
      {tabValue === 1 && (
        <GlassCard sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800, mb: 4 }}>Employee Leave Ledger</Typography>
          <TableContainer sx={{ borderRadius: '16px', border: '1px solid #F4F7FE' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F4F7FE' }}>
                <TableRow>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700 }}>EMPLOYEE ID</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700 }}>EMPLOYEE NAME</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700 }}>DEPARTMENT</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700, textAlign: 'right' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp._id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#1B254B' }}>{emp.employeeId}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#05CD99', width: 32, height: 32 }}>{emp.firstName?.charAt(0)}</Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{emp.firstName} {emp.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#A3AED0', fontWeight: 600 }}>{emp.department?.name || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => { setAssignForm({...assignForm, employeeId: emp._id}); setOpenAssignModal(true); }} startIcon={<AssignmentIndOutlinedIcon />} sx={{ mr: 1, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                        Assign Leave
                      </Button>
                      <Button size="small" variant="contained" onClick={() => openEmployeeBalanceModal(emp)} startIcon={<EditOutlinedIcon />} sx={{ bgcolor: '#4318FF', borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                        Update Balance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassCard>
      )}

      {/* --- Create Policy Modal --- */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogContent sx={{ p: 4, position: 'relative' }}>
          <IconButton onClick={() => setOpenCreateModal(false)} sx={{ position: 'absolute', right: 16, top: 16 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1B254B', mb: 3 }}>Create Leave Policy</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', display: 'block', mb: 1 }}>Leave Type (Code) *</Typography>
              <TextField select fullWidth size="small" value={policyForm.code} onChange={(e) => setPolicyForm({...policyForm, code: e.target.value})}>
                <MenuItem value="CL">Casual Leave (CL)</MenuItem>
                <MenuItem value="PL">Privilege/Earned Leave (PL)</MenuItem>
                <MenuItem value="SL">Sick Leave (SL)</MenuItem>
                <MenuItem value="ML">Maternity Leave (ML)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', display: 'block', mb: 1 }}>Leave Name *</Typography>
              <TextField fullWidth size="small" placeholder="e.g. Annual Casual Leave" value={policyForm.name} onChange={(e) => setPolicyForm({...policyForm, name: e.target.value})} />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 700, color: '#1B254B', fontSize: '0.8rem' }}>End of Year Behavior</FormLabel>
                <RadioGroup row value={policyForm.carryForward} onChange={(e) => setPolicyForm({...policyForm, carryForward: e.target.value})}>
                  <FormControlLabel value="true" control={<Radio color="primary" />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Carry Forward</Typography>} />
                  <FormControlLabel value="false" control={<Radio color="error" />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Lapsed</Typography>} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', display: 'block', mb: 1 }}>Accrual Frequency</Typography>
              <TextField select fullWidth size="small" value={policyForm.frequency} onChange={(e) => setPolicyForm({...policyForm, frequency: e.target.value})}>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Yearly">Yearly</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', display: 'block', mb: 1 }}>Total Days *</Typography>
              <TextField type="number" fullWidth size="small" value={policyForm.daysPerYear} onChange={(e) => setPolicyForm({...policyForm, daysPerYear: e.target.value})} />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5 }}>
            <Button variant="contained" onClick={handleCreatePolicy} sx={{ bgcolor: '#4318FF', fontWeight: 700, borderRadius: '12px', px: 4 }}>Save Policy</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* --- Assign Leave Modal --- */}
      <Dialog open={openAssignModal} onClose={() => setOpenAssignModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogContent sx={{ p: 4, position: 'relative' }}>
          <IconButton onClick={() => setOpenAssignModal(false)} sx={{ position: 'absolute', right: 16, top: 16 }}><CloseIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B', mb: 3 }}>Assign Leave to Employee</Typography>
          
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', display: 'block', mb: 1 }}>Select Leave Policy</Typography>
          <TextField select fullWidth size="small" sx={{ mb: 3 }} value={assignForm.leaveTypeId} onChange={(e) => setAssignForm({...assignForm, leaveTypeId: e.target.value})}>
            {leaveTypes.map(t => <MenuItem key={t._id} value={t._id}>{t.name} ({t.code})</MenuItem>)}
            {leaveTypes.length === 0 && <MenuItem disabled>No policies created</MenuItem>}
          </TextField>

          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B254B', display: 'block', mb: 1 }}>Initial Balance (Days)</Typography>
          <TextField type="number" fullWidth size="small" value={assignForm.initialBalance} onChange={(e) => setAssignForm({...assignForm, initialBalance: e.target.value})} />

          <Button fullWidth variant="contained" onClick={handleAssignLeave} disabled={!assignForm.leaveTypeId} sx={{ bgcolor: '#05CD99', mt: 4, borderRadius: '12px', fontWeight: 800 }}>Assign & Setup Balance</Button>
        </DialogContent>
      </Dialog>

      {/* --- Update Balance Modal --- */}
      <Dialog open={openBalanceModal} onClose={() => setOpenBalanceModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogContent sx={{ p: 4, position: 'relative' }}>
          <IconButton onClick={() => setOpenBalanceModal(false)} sx={{ position: 'absolute', right: 16, top: 16 }}><CloseIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1B254B', mb: 1 }}>Leave Balance Ledger</Typography>
          <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 600, mb: 4 }}>
            Managing balances for: <b>{selectedEmpForBalance?.firstName} {selectedEmpForBalance?.lastName}</b>
          </Typography>

          {balances.filter(b => b.employee?._id === selectedEmpForBalance?._id).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: '#EE5D50', fontWeight: 700 }}>No leaves assigned to this employee yet.</Typography>
              <Typography variant="body2" sx={{ color: '#A3AED0', mt: 1 }}>Please assign a leave policy first.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F4F7FE' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>LEAVE TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>CURRENT BALANCE</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balances.filter(b => b.employee?._id === selectedEmpForBalance?._id).map(b => (
                    <TableRow key={b._id}>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {getTypeChip(b.leaveType)}
                      </TableCell>
                      <TableCell>
                        <TextField 
                          size="small" 
                          type="number" 
                          sx={{ width: 80 }}
                          value={balanceForm[b.leaveType?._id] !== undefined ? balanceForm[b.leaveType?._id] : b.balance}
                          onChange={(e) => setBalanceForm({ ...balanceForm, [b.leaveType?._id]: e.target.value })}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="contained" size="small" onClick={() => handleUpdateBalance(b.leaveType?._id)} sx={{ bgcolor: '#4318FF', borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Side Drawer for Employee Details --- */}
      <Drawer anchor="right" open={!!selectedRecord} onClose={() => setSelectedRecord(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, bgcolor: '#FFFFFF', p: 0 } }}>
        {selectedRecord && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F7FE' }}>
              <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800 }}>Request Details</Typography>
              <IconButton onClick={() => setSelectedRecord(null)} sx={{ bgcolor: '#F4F7FE' }}><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, p: 3, borderRadius: '20px', bgcolor: '#F4F7FE' }}>
                <Avatar sx={{ width: 70, height: 70, bgcolor: '#4318FF', fontSize: '1.8rem', fontWeight: 800 }}>
                  {selectedRecord.employee?.firstName?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900, mb: 0.5 }}>{selectedRecord.employee?.firstName}</Typography>
                  <Typography variant="body2" sx={{ color: '#4318FF', fontWeight: 700 }}>{selectedRecord.employee?.designation?.name || 'Employee'}</Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#1B254B', fontWeight: 800, mb: 2 }}>Leave Request</Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                   <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid #F4F7FE' }}>
                     <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600, display: 'block', mb: 1 }}>Leave Type</Typography>
                     {getTypeChip(selectedRecord.leaveType)}
                   </Box>
                </Grid>
                <Grid item xs={6}>
                   <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid #F4F7FE' }}>
                     <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600, display: 'block', mb: 1 }}>Status</Typography>
                     {getStatusChip(selectedRecord.status)}
                   </Box>
                </Grid>
              </Grid>
            </Box>
            {selectedRecord.status?.toUpperCase() === 'PENDING' && (
              <Box sx={{ p: 3, borderTop: '1px solid #F4F7FE', display: 'flex', gap: 2 }}>
                <Button fullWidth variant="outlined" onClick={() => handleApproveReject(selectedRecord._id, 'REJECTED')} sx={{ borderRadius: '14px', color: '#EE5D50', borderColor: '#EE5D50', py: 1.5, fontWeight: 700 }}>Reject</Button>
                <Button fullWidth variant="contained" onClick={() => handleApproveReject(selectedRecord._id, 'APPROVED')} sx={{ borderRadius: '14px', bgcolor: '#05CD99', py: 1.5, fontWeight: 700 }}>Approve</Button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default AdminLeave;
