import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Avatar, Chip, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Select, FormControl, InputAdornment, Menu,
  Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Skeleton,
  List, ListItem, ListItemAvatar, ListItemText, LinearProgress, Divider
} from '@mui/material';

// Icons
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';

import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

// --- Premium UI Components ---

const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const diffMs = new Date() - new Date(startTime);
      if (diffMs < 0) return;
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setElapsed(`${hrs}h ${mins}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [startTime]);
  
  return <span style={{ color: '#01B574', display: 'flex', alignItems: 'center', gap: '4px' }}>{elapsed} <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#E2FFE9', borderRadius: '4px' }}>Live</span></span>;
};

const GlassCard = ({ children, sx, onClick }) => (
  <Paper elevation={0} onClick={onClick} sx={{
    bgcolor: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0px 10px 30px rgba(112, 144, 176, 0.08)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: onClick ? 'pointer' : 'default',
    '&:hover': {
      transform: onClick ? 'translateY(-4px)' : 'translateY(-2px)',
      boxShadow: '0px 15px 35px rgba(112, 144, 176, 0.12)',
    },
    ...sx
  }}>
    {children}
  </Paper>
);

const KPIWidget = ({ title, value, subtitle, icon: Icon, color, loading, onClick, isActive }) => (
  <GlassCard onClick={onClick} sx={{ 
    p: 3, display: 'flex', alignItems: 'center', gap: 2.5, flex: 1, minWidth: 200,
    border: isActive ? `2px solid ${color}` : '1px solid rgba(226, 232, 240, 0.8)',
    bgcolor: isActive ? `${color}08` : '#FFFFFF'
  }}>
    <Box sx={{
      width: 56, height: 56, borderRadius: '18px',
      background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color, flexShrink: 0
    }}>
      <Icon sx={{ fontSize: '2rem' }} />
    </Box>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 700, mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
      {loading ? <Skeleton width={60} height={35} /> : (
        <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
      )}
    </Box>
  </GlassCard>
);


// --- Main Dashboard Component ---

const AdminDashboard = () => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [statsLoading, setStatsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openCorrectionModal, setOpenCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({ checkIn: '', checkOut: '', workHours: '', status: 'PRESENT' });
  const [openViewModal, setOpenViewModal] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10; 

  useEffect(() => {
    fetchStats();
    fetchAttendance();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axiosClient.get('/dashboard/stats');
      setStats(res.stats || res);
    } catch (err) {
      console.log('Using fallback stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setTableLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        axiosClient.get('/employees').catch(() => null),
        axiosClient.get('/attendance/logs').catch(() => null)
      ]);
      if (empRes?.data?.length > 0 || Array.isArray(empRes)) {
        const empList = Array.isArray(empRes) ? empRes : empRes.data;
        const attLogs = attRes?.data?.data || attRes?.data || attRes || [];
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const mapped = empList.map((emp, index) => {
          const punch = attLogs.find(a => {
            const empMatch = (a.employee?._id === emp._id || a.employee === emp._id);
            if (!empMatch) return false;
            if (!a.punchIn && !a.date) return false;
            const punchDate = new Date(a.punchIn || a.date);
            return punchDate >= startOfToday;
          });

          const isTodayPunch = !!punch;
          return {
            id: index + 1,
            empId: emp.employeeId || `LX${String(index + 1).padStart(3, '0')}`,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
            email: emp.email || '',
            dept: emp.department?.name || emp.department || '—',
            checkInRaw: isTodayPunch ? punch.punchIn : null,
            checkIn: isTodayPunch && punch.punchIn ? new Date(punch.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
            checkOut: isTodayPunch && punch.punchOut ? new Date(punch.punchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
            workHours: isTodayPunch && punch.totalHours ? `${punch.totalHours}h` : '—',
            status: isTodayPunch ? (punch.status || 'PRESENT') : 'NOT_PUNCHED_IN',
            location: emp.branch?.location || 'Mohali, Punjab',
            avatar: emp.user?.avatar || '',
            sessions: isTodayPunch && punch.sessions ? punch.sessions : []
          };
        });
        setAttendanceRecords(mapped);
      }
    } catch (err) {
      console.log('Attendance fetch error');
    } finally {
      setTableLoading(false);
    }
  };

  const handleMenuOpen = (e, record) => {
    setAnchorEl(e.currentTarget);
    setSelectedRecord(record);
    setCorrectionForm({ checkIn: record.checkIn, checkOut: record.checkOut, workHours: record.workHours, status: record.status });
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await axiosClient.put(`/attendance/${selectedRecord.empId}/correct`, correctionForm);
      toast.success(`Attendance updated for ${selectedRecord.name}!`);
      fetchAttendance(); 
    } catch (err) {
      toast.error('Failed to correct punch');
    }
    setOpenCorrectionModal(false);
    handleMenuClose();
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedRecord) return;
    try {
      await axiosClient.put(`/attendance/${selectedRecord.empId}/status`, { status: newStatus });
      toast.success(`Status set to ${newStatus} for ${selectedRecord.name}`);
      fetchAttendance();
    } catch (err) {
      toast.error('Failed to update status');
    }
    handleMenuClose();
  };

  const handleKpiClick = (status) => {
    setStatusFilter(status);
    setPage(1);
    const tableEl = document.getElementById('attendance-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCount = stats?.totalEmployees || attendanceRecords.length || 0;
  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'WORKING').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT' || r.status === 'NOT_PUNCHED_IN').length;
  const onLeaveCount = attendanceRecords.filter(r => r.status === 'ON_LEAVE' || r.status === 'TIME_OFF').length;
  const onBreakCount = attendanceRecords.filter(r => r.status === 'ON_BREAK').length;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const filteredRecords = attendanceRecords.filter(r => {
    const s = r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()) || r.empId.toLowerCase().includes(search.toLowerCase());
    const d = deptFilter === 'All Departments' || r.dept === deptFilter;
    const mappedStatus = r.status === 'NOT_PUNCHED_IN' ? 'ABSENT' : r.status;
    const st = statusFilter === 'All Status' || mappedStatus === statusFilter;
    return s && d && st;
  });

  const paginatedRecords = filteredRecords.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const uniqueDepts = ['All Departments', ...new Set(attendanceRecords.map(r => r.dept).filter(Boolean))];

  const getStatusChip = (status) => {
    const s = (status === 'NOT_PUNCHED_IN' ? 'ABSENT' : status)?.toUpperCase() || 'ABSENT';
    const config = {
      PRESENT: { bg: '#E2FFE9', color: '#01B574', label: 'Present' },
      WORKING: { bg: '#E2FFE9', color: '#01B574', label: 'Working' },
      ABSENT: { bg: '#FFE2E5', color: '#E31A1A', label: 'Absent' },
      ON_LEAVE: { bg: '#FFF5D8', color: '#FFB547', label: 'On Leave' },
      TIME_OFF: { bg: '#FFF5D8', color: '#FFB547', label: 'Time Off' },
      HALF_DAY: { bg: '#E9EDF7', color: '#4318FF', label: 'Half Day' },
      ON_BREAK: { bg: '#FFF5D8', color: '#F59E0B', label: 'On Break' }
    };
    const c = config[s] || config.ABSENT;
    return <Chip label={c.label} sx={{ bgcolor: c.bg, color: c.color, fontWeight: 800, borderRadius: '8px', px: 1, height: 26, fontSize: '0.7rem' }} />;
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F4F7FE', p: { xs: 2, md: 4 } }}>
      
      {/* --- Premium Header --- */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ color: '#1B254B', fontWeight: 900, mb: 1, letterSpacing: '-1px' }}>
            {greeting}, Admin 👋
          </Typography>
          <Typography variant="h6" sx={{ color: '#A3AED0', fontWeight: 500 }}>
            Overview of your organization — <strong style={{ color: '#1B254B' }}>{today}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => toast.success('Report downloading...')} sx={{ borderRadius: '16px', borderColor: '#E2E8F0', color: '#1B254B', fontWeight: 700, textTransform: 'none', px: 3, py: 1.5, bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#F8FAFC' } }}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<FlashOnIcon />} onClick={() => toast.success('Quick Actions Panel Opened')} sx={{
            bgcolor: '#4318FF', color: '#fff', fontWeight: 700, px: 4, py: 1.5, borderRadius: '16px',
            textTransform: 'none', boxShadow: '0px 10px 20px rgba(67, 24, 255, 0.2)',
            '&:hover': { bgcolor: '#3311CC', boxShadow: '0px 15px 25px rgba(67, 24, 255, 0.3)' }
          }}>
            Quick Actions
          </Button>
        </Box>
      </Box>

      {/* --- Main Grid Layout --- */}
      <Grid container spacing={4}>
        {/* Left Content (Cards + Table + Bottom Sections) */}
        <Grid item xs={12} xl={9}>
          
          {/* --- KPI Widgets Row --- */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
            <KPIWidget 
              title="Total Employees" value={totalCount} color="#4318FF" icon={PeopleOutlinedIcon} loading={statsLoading} 
              onClick={() => handleKpiClick('All Status')} isActive={statusFilter === 'All Status'}
            />
            <KPIWidget 
              title="Present Today" value={presentCount} color="#05CD99" icon={HowToRegIcon} loading={tableLoading} 
              onClick={() => handleKpiClick('PRESENT')} isActive={statusFilter === 'PRESENT'}
            />
            <KPIWidget 
              title="On Leave" value={onLeaveCount} color="#FFCE20" icon={BeachAccessIcon} loading={tableLoading} 
              onClick={() => handleKpiClick('ON_LEAVE')} isActive={statusFilter === 'ON_LEAVE'}
            />
            <KPIWidget 
              title="Absent" value={absentCount} color="#EE5D50" icon={CheckCircleOutlinedIcon} loading={tableLoading} 
              onClick={() => handleKpiClick('ABSENT')} isActive={statusFilter === 'ABSENT'}
            />
            <KPIWidget 
              title="On Break" value={onBreakCount} color="#39B8FF" icon={AccessTimeIcon} loading={statsLoading} 
              onClick={() => handleKpiClick('ON_BREAK')} isActive={statusFilter === 'ON_BREAK'}
            />
          </Box>

          {/* --- Master Table (Attendance) --- */}
          <GlassCard id="attendance-table" sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900, mb: 0.5 }}>Today's Attendance</Typography>
                <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 600 }}>Real-time directory for all employees</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField 
                  placeholder="Search..." size="small"
                  value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#A3AED0' }} /></InputAdornment>,
                    sx: { borderRadius: '12px', bgcolor: '#F4F7FE', '& fieldset': { border: 'none' }, minWidth: 200, fontWeight: 600, color: '#1B254B' }
                  }}
                />
                <Select size="small" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: '12px', bgcolor: '#F4F7FE', color: '#1B254B', fontWeight: 700, '& fieldset': { border: 'none' }, minWidth: 150 }}>
                  {uniqueDepts.map(d => <MenuItem key={d} value={d} sx={{ fontWeight: 600 }}>{d}</MenuItem>)}
                </Select>
                <Select size="small" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: '12px', bgcolor: '#F4F7FE', color: '#1B254B', fontWeight: 700, '& fieldset': { border: 'none' }, minWidth: 140 }}>
                  <MenuItem value="All Status" sx={{ fontWeight: 600 }}>All Status</MenuItem>
                  <MenuItem value="PRESENT" sx={{ fontWeight: 600 }}>Present</MenuItem>
                  <MenuItem value="ON_BREAK" sx={{ fontWeight: 600 }}>On Break</MenuItem>
                  <MenuItem value="WORKING" sx={{ fontWeight: 600 }}>Working</MenuItem>
                  <MenuItem value="ABSENT" sx={{ fontWeight: 600 }}>Absent</MenuItem>
                  <MenuItem value="HALF_DAY" sx={{ fontWeight: 600 }}>Half Day</MenuItem>
                  <MenuItem value="ON_LEAVE" sx={{ fontWeight: 600 }}>On Leave</MenuItem>
                </Select>
              </Box>
            </Box>

            <TableContainer sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #F4F7FE' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    {['EMPLOYEE', 'EMAIL', 'DEPT', 'IN', 'OUT', 'HRS', 'STATUS', 'LOCATION', 'ACTIONS'].map(th => (
                      <TableCell key={th} sx={{ color: '#A3AED0', fontWeight: 800, fontSize: '0.75rem', letterSpacing: 0.5, borderBottom: 'none', py: 2 }}>{th}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderBottom: '1px solid #F4F7FE', py: 2 }}><Skeleton height={24} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6 }}>
                         <Typography variant="body1" sx={{ color: '#A3AED0', fontWeight: 700 }}>No attendance records found.</Typography>
                         <Button variant="text" onClick={() => { setSearch(''); setDeptFilter('All Departments'); setStatusFilter('All Status'); }} sx={{ mt: 1, color: '#4318FF', fontWeight: 800, textTransform: 'none' }}>Clear Filters</Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map(r => (
                      <TableRow key={r.id} sx={{ '&:hover': { bgcolor: '#F9FAFD' }, transition: 'background 0.2s' }}>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#4318FF', color: '#FFF', fontWeight: 800, fontSize: '0.9rem' }}>
                              {r.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 800 }}>{r.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700 }}>{r.empId}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: '#A3AED0', fontWeight: 600, fontSize: '0.8rem' }}>
                          {r.email}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE' }}>
                           <Chip label={r.dept} sx={{ bgcolor: '#F4F7FE', color: '#4318FF', fontWeight: 800, borderRadius: '8px', height: 24, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: r.checkIn !== '—' ? '#01B574' : '#A3AED0', fontWeight: 800, fontSize: '0.85rem' }}>
                          {r.checkIn}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: r.checkOut !== '—' ? '#4318FF' : '#A3AED0', fontWeight: 800, fontSize: '0.85rem' }}>
                          {r.checkOut}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: '#1B254B', fontWeight: 900, fontSize: '0.85rem' }}>
                          {r.checkInRaw && r.checkOut === '—' ? <LiveTimer startTime={r.checkInRaw} /> : r.workHours}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE' }}>
                          {getStatusChip(r.status)}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: '#A3AED0', fontWeight: 600, fontSize: '0.8rem' }}>
                          {r.location}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE' }}>
                          <IconButton onClick={(e) => handleMenuOpen(e, r)} sx={{ color: '#1B254B', bgcolor: '#F4F7FE', borderRadius: '8px', p: 0.5, '&:hover': { bgcolor: '#E9EDF7' } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 700 }}>
                Showing {paginatedRecords.length} of {filteredRecords.length}
              </Typography>
              <Pagination count={Math.ceil(filteredRecords.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)} 
                sx={{ '& .MuiPaginationItem-root': { color: '#1B254B', fontWeight: 800, fontSize: '0.85rem' }, '& .Mui-selected': { bgcolor: '#4318FF !important', color: '#fff' } }} />
            </Box>
          </GlassCard>

          {/* --- Bottom Sections (3 Columns) --- */}
          <Grid container spacing={3}>
            {/* Department Overview */}
            <Grid item xs={12} md={4}>
              <GlassCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800, mb: 3 }}>Department Overview</Typography>
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1B254B' }}>Engineering</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#4318FF' }}>45%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4, bgcolor: '#F4F7FE', '& .MuiLinearProgress-bar': { bgcolor: '#4318FF', borderRadius: 4 } }} />
                </Box>
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1B254B' }}>Information Technology</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#01B574' }}>30%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={30} sx={{ height: 8, borderRadius: 4, bgcolor: '#F4F7FE', '& .MuiLinearProgress-bar': { bgcolor: '#01B574', borderRadius: 4 } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1B254B' }}>Human Resources</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#FFB547' }}>25%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={25} sx={{ height: 8, borderRadius: 4, bgcolor: '#F4F7FE', '& .MuiLinearProgress-bar': { bgcolor: '#FFB547', borderRadius: 4 } }} />
                </Box>
              </GlassCard>
            </Grid>

            {/* Recent Requests */}
            <Grid item xs={12} md={4}>
              <GlassCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 800, mb: 2 }}>Recent Requests</Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: '#FFF5D8', color: '#FFB547' }}><EventNoteOutlinedIcon fontSize="small" /></Avatar></ListItemAvatar>
                    <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700, color: '#1B254B' }}>Sick Leave Request</Typography>} secondary={<Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>Alice Johnson • Pending</Typography>} />
                  </ListItem>
                  <Divider sx={{ borderStyle: 'dashed', borderColor: '#E2E8F0' }} />
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: '#E2FFE9', color: '#01B574' }}><ReceiptOutlinedIcon fontSize="small" /></Avatar></ListItemAvatar>
                    <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700, color: '#1B254B' }}>Payslip Dispute</Typography>} secondary={<Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>Mark Smith • Resolved</Typography>} />
                  </ListItem>
                  <Divider sx={{ borderStyle: 'dashed', borderColor: '#E2E8F0' }} />
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: '#E9EDF7', color: '#4318FF' }}><ComputerOutlinedIcon fontSize="small" /></Avatar></ListItemAvatar>
                    <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700, color: '#1B254B' }}>New Laptop Asset</Typography>} secondary={<Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>IT Dept • Approved</Typography>} />
                  </ListItem>
                </List>
              </GlassCard>
            </Grid>

            {/* Payroll Summary */}
            <Grid item xs={12} md={4}>
              <GlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4318FF22', color: '#4318FF', width: 48, height: 48 }}><AccountBalanceOutlinedIcon /></Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 700, textTransform: 'uppercase' }}>Total Payroll</Typography>
                    <Typography variant="h5" sx={{ color: '#1B254B', fontWeight: 900 }}>$124,500</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2, borderColor: '#F4F7FE' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>Processed</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#01B574', fontWeight: 800 }}>$98,200</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>Pending</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#FFB547', fontWeight: 800 }}>$26,300</Typography>
                  </Box>
                </Box>
                <Button variant="outlined" fullWidth sx={{ mt: 3, borderRadius: '12px', borderColor: '#E2E8F0', color: '#4318FF', fontWeight: 700, textTransform: 'none' }}>
                  Run Payroll
                </Button>
              </GlassCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} xl={3}>
          {/* Quick Actions */}
          <GlassCard sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 900, mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Add Employee', icon: <PersonAddOutlinedIcon />, color: '#4318FF' },
                { label: 'Apply Leave', icon: <EventNoteOutlinedIcon />, color: '#01B574' },
                { label: 'Attendance', icon: <CheckCircleOutlinedIcon />, color: '#FFB547' },
                { label: 'Run Payroll', icon: <AccountBalanceWalletOutlinedIcon />, color: '#E31A1A' },
                { label: 'View Payslip', icon: <ReceiptOutlinedIcon />, color: '#39B8FF' },
                { label: 'Documents', icon: <FolderOpenOutlinedIcon />, color: '#8B5CF6' }
              ].map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ 
                    p: 2, borderRadius: '16px', bgcolor: '#F4F7FE', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s', '&:hover': { bgcolor: `${action.color}11`, transform: 'translateY(-2px)' }
                  }} onClick={() => toast.success(`Navigating to ${action.label}`)}>
                    <Avatar sx={{ bgcolor: `${action.color}22`, color: action.color, width: 40, height: 40, mx: 'auto', mb: 1 }}>{action.icon}</Avatar>
                    <Typography variant="caption" sx={{ color: '#1B254B', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>{action.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </GlassCard>

          {/* Announcements */}
          <GlassCard sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 900, mb: 2 }}>Announcements</Typography>
            <List sx={{ p: 0 }}>
              {[
                { title: 'Company Holiday', date: 'Aug 15', icon: <CampaignOutlinedIcon />, color: '#4318FF' },
                { title: 'Policy Update', date: 'Aug 20', icon: <DescriptionOutlinedIcon />, color: '#FFB547' },
                { title: 'Work Anniversary', date: 'Aug 25', icon: <EmojiEventsOutlinedIcon />, color: '#01B574' }
              ].map((item, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1.5, borderBottom: index < 2 ? '1px dashed #E2E8F0' : 'none' }}>
                  <ListItemAvatar><Avatar sx={{ bgcolor: `${item.color}22`, color: item.color, width: 40, height: 40 }}>{item.icon}</Avatar></ListItemAvatar>
                  <ListItemText 
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{item.title}</Typography>} 
                    secondary={<Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>{item.date}</Typography>} 
                  />
                  <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                </ListItem>
              ))}
            </List>
          </GlassCard>

          {/* Upcoming Events */}
          <GlassCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#1B254B', fontWeight: 900, mb: 2 }}>Upcoming Events</Typography>
            <List sx={{ p: 0 }}>
              {[
                { title: 'Townhall Meeting', time: '10:00 AM - 11:00 AM', day: '12', month: 'Aug' },
                { title: 'Project Deadline', time: '5:00 PM', day: '14', month: 'Aug' },
                { title: 'Team Outing', time: '12:00 PM - 4:00 PM', day: '18', month: 'Aug' }
              ].map((event, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1.5, borderBottom: index < 2 ? '1px dashed #E2E8F0' : 'none', gap: 2 }}>
                  <Box sx={{ bgcolor: '#F4F7FE', borderRadius: '12px', p: 1, textAlign: 'center', minWidth: 50 }}>
                    <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>{event.month}</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#4318FF', fontWeight: 900, lineHeight: 1 }}>{event.day}</Typography>
                  </Box>
                  <ListItemText 
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{event.title}</Typography>} 
                    secondary={<Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>{event.time}</Typography>} 
                  />
                </ListItem>
              ))}
            </List>
          </GlassCard>
        </Grid>
      </Grid>

      {/* --- Context Menu --- */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #F4F7FE', boxShadow: '0px 10px 30px rgba(112, 144, 176, 0.15)', minWidth: 220, p: 1 } }}>
        <MenuItem onClick={() => { setOpenViewModal(true); handleMenuClose(); }} sx={{ borderRadius: '10px', py: 1.5, gap: 2, color: '#1B254B', fontWeight: 800, fontSize: '0.9rem' }}>
          <VisibilityOutlinedIcon sx={{ color: '#4318FF', fontSize: '1.4rem' }} /> View Full Log
        </MenuItem>
        <MenuItem onClick={() => { setOpenCorrectionModal(true); handleMenuClose(); }} sx={{ borderRadius: '10px', py: 1.5, gap: 2, color: '#1B254B', fontWeight: 800, fontSize: '0.9rem' }}>
          <EditOutlinedIcon sx={{ color: '#FFB547', fontSize: '1.4rem' }} /> Correct Punch
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('PRESENT')} sx={{ borderRadius: '10px', py: 1.5, gap: 2, color: '#01B574', fontWeight: 800, fontSize: '0.9rem' }}>
          <CheckCircleIcon sx={{ fontSize: '1.4rem' }} /> Mark Present
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('ABSENT')} sx={{ borderRadius: '10px', py: 1.5, gap: 2, color: '#E31A1A', fontWeight: 800, fontSize: '0.9rem' }}>
          <CancelIcon sx={{ fontSize: '1.4rem' }} /> Mark Absent
        </MenuItem>
      </Menu>

      {/* --- Correction Modal --- */}
      <Dialog open={openCorrectionModal} onClose={() => setOpenCorrectionModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#4318FF', p: 4, color: '#fff', position: 'relative' }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Attendance Correction</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.8, mt: 0.5 }}>Update punch records for {selectedRecord?.name}</Typography>
        </Box>
        <form onSubmit={handleCorrectionSubmit}>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, mb: 1, display: 'block' }}>Check In Time</Typography>
                <TextField fullWidth value={correctionForm.checkIn} onChange={(e) => setCorrectionForm({ ...correctionForm, checkIn: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F4F7FE', '& fieldset': { border: 'none' } } }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, mb: 1, display: 'block' }}>Check Out Time</Typography>
                <TextField fullWidth value={correctionForm.checkOut} onChange={(e) => setCorrectionForm({ ...correctionForm, checkOut: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F4F7FE', '& fieldset': { border: 'none' } } }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, mb: 1, display: 'block' }}>Total Working Hours</Typography>
                <TextField fullWidth value={correctionForm.workHours} onChange={(e) => setCorrectionForm({ ...correctionForm, workHours: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F4F7FE', '& fieldset': { border: 'none' } } }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, mb: 1, display: 'block' }}>Attendance Status</Typography>
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F4F7FE', '& fieldset': { border: 'none' } } }}>
                  <Select value={correctionForm.status} onChange={(e) => setCorrectionForm({ ...correctionForm, status: e.target.value })}>
                    <MenuItem value="PRESENT">Present</MenuItem>
                    <MenuItem value="WORKING">Working</MenuItem>
                    <MenuItem value="ABSENT">Absent</MenuItem>
                    <MenuItem value="HALF_DAY">Half Day</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0, gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenCorrectionModal(false)} sx={{ color: '#A3AED0', fontWeight: 800, textTransform: 'none', fontSize: '1rem' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#4318FF', borderRadius: '14px', fontWeight: 800, textTransform: 'none', px: 4, py: 1.5, fontSize: '1rem' }}>Apply Correction</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* --- View Modal --- */}
      <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4, bgcolor: '#F4F7FE', borderBottom: '1px solid #E2E8F0' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#4318FF', fontWeight: 800, fontSize: '1.5rem' }}>{selectedRecord?.name?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1B254B' }}>{selectedRecord?.name}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#A3AED0' }}>{selectedRecord?.empId} • {selectedRecord?.dept}</Typography>
          </Box>
          <Box sx={{ ml: 'auto', textAlign: 'right' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B', lineHeight: 1 }}>{selectedRecord?.workHours}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#A3AED0' }}>Total Hours</Typography>
          </Box>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1B254B', mb: 3 }}>Punch Timeline</Typography>
          
          <Box sx={{ position: 'relative', pl: 3, '&::before': { content: '""', position: 'absolute', left: 11, top: 10, bottom: 10, width: 2, bgcolor: '#E2E8F0', borderRadius: 1 } }}>
            {(!selectedRecord?.sessions || selectedRecord?.sessions.length === 0) && selectedRecord?.checkIn !== '—' && (
              <>
                <Box sx={{ position: 'relative', mb: 4 }}>
                  <Box sx={{ position: 'absolute', left: -24, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: '#01B574', border: '3px solid #E2FFE9' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{selectedRecord?.checkIn}</Typography>
                  <Typography variant="caption" sx={{ color: '#01B574', fontWeight: 800 }}>PUNCHED IN</Typography>
                  <Typography variant="caption" sx={{ color: '#A3AED0', display: 'block', mt: 0.5, fontWeight: 600 }}>📍 {selectedRecord?.location} (Verified IP)</Typography>
                </Box>
                {selectedRecord?.checkOut !== '—' && (
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: -24, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: '#E31A1A', border: '3px solid #FFE2E5' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{selectedRecord?.checkOut}</Typography>
                    <Typography variant="caption" sx={{ color: '#E31A1A', fontWeight: 800 }}>PUNCHED OUT</Typography>
                    <Typography variant="caption" sx={{ color: '#A3AED0', display: 'block', mt: 0.5, fontWeight: 600 }}>📍 {selectedRecord?.location}</Typography>
                  </Box>
                )}
              </>
            )}

            {selectedRecord?.sessions && selectedRecord?.sessions.length > 0 && selectedRecord.sessions.map((session, idx) => (
              <React.Fragment key={idx}>
                {session.punchIn && (
                  <Box sx={{ position: 'relative', mb: 4 }}>
                    <Box sx={{ position: 'absolute', left: -24, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: '#01B574', border: '3px solid #E2FFE9' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{new Date(session.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Typography>
                    <Typography variant="caption" sx={{ color: '#01B574', fontWeight: 800 }}>PUNCHED IN</Typography>
                    <Typography variant="caption" sx={{ color: '#A3AED0', display: 'block', mt: 0.5, fontWeight: 600 }}>📍 {selectedRecord?.location} (Verified IP)</Typography>
                  </Box>
                )}
                {session.punchOut && (
                  <Box sx={{ position: 'relative', mb: 4 }}>
                    <Box sx={{ position: 'absolute', left: -24, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: '#E31A1A', border: '3px solid #FFE2E5' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{new Date(session.punchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Typography>
                    <Typography variant="caption" sx={{ color: '#E31A1A', fontWeight: 800 }}>PUNCHED OUT</Typography>
                    <Typography variant="caption" sx={{ color: '#A3AED0', display: 'block', mt: 0.5, fontWeight: 600 }}>📍 {selectedRecord?.location}</Typography>
                  </Box>
                )}
              </React.Fragment>
            ))}

            {selectedRecord?.checkIn === '—' && selectedRecord?.checkOut === '—' && (!selectedRecord?.sessions || selectedRecord?.sessions.length === 0) && (
               <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 600, fontStyle: 'italic' }}>No punch records available for this day.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button onClick={() => setOpenViewModal(false)} variant="contained" fullWidth sx={{ bgcolor: '#4318FF', borderRadius: '14px', fontWeight: 800, textTransform: 'none', py: 1.5, fontSize: '1rem' }}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
