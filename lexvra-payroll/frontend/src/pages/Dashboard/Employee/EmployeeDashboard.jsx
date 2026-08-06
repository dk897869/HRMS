import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Button, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Skeleton, TextField, Dialog, DialogContent, DialogActions, IconButton, DialogTitle
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Coffee as CoffeeIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlined as ErrorOutlineIcon,
  Cake as CakeIcon,
  Send as SendIcon,
  Verified as VerifiedIcon,
  Person as PersonOutlineIcon,
  Domain as DomainIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Article as ArticleIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Bolt as BoltIcon,
  ArrowForward as ArrowForwardIcon,
  EditCalendar as EditCalendarIcon,
  ReceiptLong as ReceiptLongIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const EmployeeDashboard = () => {
  const reduxUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: reduxUser?.name || 'Loading...',
    empId: reduxUser?.employeeRef?.employeeId || '',
    title: reduxUser?.employeeRef?.designation?.title || 'Employee',
    department: reduxUser?.employeeRef?.department?.name || 'General',
    avatar: reduxUser?.avatar || '',
  });

  // Timer State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);

  // History State
  const [historyTab, setHistoryTab] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  // Birthdays
  const [birthdays, setBirthdays] = useState([]);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [wishing, setWishing] = useState(null);
  const [wishDialog, setWishDialog] = useState(false);
  const [wishEmp, setWishEmp] = useState(null);
  const [wishMessage, setWishMessage] = useState('');

  const suggestedMessages = [
    "Happy Birthday! Have a fantastic day! ðŸŽ‰",
    "Wishing you a great year ahead! ðŸŽ‚",
    "Hope your special day brings you all that your heart desires! ðŸŽ",
    "Happy Birthday! Wishing you success and happiness! âœ¨"
  ]; 

  // Correction Request States
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [reqCheckIn, setReqCheckIn] = useState('09:00 AM');
  const [reqCheckOut, setReqCheckOut] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // 1. Initial Load & Hydration
  useEffect(() => {
    fetchProfile();
    fetchLogs();
    fetchBirthdays();
  }, []);

  // Real-time socket listener when Admin corrects punch time!
  useEffect(() => {
    const empId = typeof reduxUser?.employeeRef === 'object' ? reduxUser?.employeeRef?._id : reduxUser?.employeeRef;
    if (!empId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://lx-hrms-1.onrender.com');
    socket.emit('join_user_room', empId);

    socket.on('attendance_updated', (data) => {
      toast.success('Your attendance punch time was updated by Admin!');
      fetchProfile();
      fetchLogs();
    });

    return () => socket.disconnect();
  }, [reduxUser]);

  // 2. LocalStorage Persistence for Timers
  useEffect(() => {
    if (!user.empId) return;
    const storedState = localStorage.getItem(`emp_punch_state_${user.empId}`);
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        const elapsedSec = Math.floor((Date.now() - parsed.timestamp) / 1000);
        
        // Auto-checkout after 12 hours safety
        if (parsed.isCheckedIn && elapsedSec > 43200) {
          setIsCheckedIn(false);
          localStorage.removeItem(`emp_punch_state_${user.empId}`);
        } else if (parsed.isCheckedIn) {
          setIsCheckedIn(true);
          setIsOnBreak(parsed.isOnBreak || false);
          setWorkingSeconds(Math.max(0, parsed.baseWorkingSeconds + (!parsed.isOnBreak ? elapsedSec : 0)));
          setBreakSeconds(Math.max(0, parsed.baseBreakSeconds + (parsed.isOnBreak ? elapsedSec : 0)));
        }
      } catch (e) {}
    }
  }, [user.empId]);

  // 3. Live Ticking Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (isCheckedIn && !isOnBreak) {
        setWorkingSeconds(prev => prev + 1);
      } else if (isCheckedIn && isOnBreak) {
        setBreakSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, isOnBreak]);

  const saveTimerState = (checkedIn, onBreak, workSec, breakSec) => {
    localStorage.setItem(`emp_punch_state_${user.empId}`, JSON.stringify({
      isCheckedIn: checkedIn,
      isOnBreak: onBreak,
      baseWorkingSeconds: workSec,
      baseBreakSeconds: breakSec,
      timestamp: Date.now()
    }));
  };

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      const u = res?.data?.user || res?.user || res?.data;
      if (u) {
        setUser({
          name: u.name || reduxUser?.name || 'Employee',
          empId: u.employeeRef?.employeeId || reduxUser?.employeeRef?.employeeId || 'EMP001',
          title: u.employeeRef?.designation?.title || u.employeeRef?.designation || 'Staff',
          department: u.employeeRef?.department?.name || u.employeeRef?.department || 'General',
          avatar: u.avatar || '',
        });
      }
    } catch (err) {}
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await axiosClient.get('/attendance/logs');
      let data = Array.isArray(res) ? res : (res?.data || res?.logs || []);
      const myId = reduxUser?.employeeRef?._id || reduxUser?.employeeRef || reduxUser?._id;
      const myEmpCode = user.empId || reduxUser?.employeeRef?.employeeId;

      const myLogs = data.filter(l => 
        l.employee?.employeeId === myEmpCode || 
        l.employee === myId || 
        l.employee?._id === myId
      );
      setLogs(myLogs);

      // Find Today's Punch to sync live working hours timer with Admin Dashboard!
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const todayLog = myLogs.find(l => {
        if (!l.punchIn && !l.date) return false;
        const d = new Date(l.punchIn || l.date);
        return d >= startOfToday;
      });

      if (todayLog && (todayLog.punchIn || todayLog.sessions?.length > 0)) {
        let isWorking = false;
        let pastSessionsSec = 0;
        let activePunchIn = null;

        if (todayLog.sessions && todayLog.sessions.length > 0) {
          todayLog.sessions.forEach(s => {
            if (s.punchOut) {
              pastSessionsSec += Math.floor((new Date(s.punchOut).getTime() - new Date(s.punchIn).getTime()) / 1000);
            } else if (s.punchIn) {
              isWorking = true;
              activePunchIn = s.punchIn;
            }
          });
        } else {
          isWorking = !todayLog.punchOut;
          activePunchIn = todayLog.punchIn;
        }

        setIsCheckedIn(isWorking);
        setIsOnBreak(todayLog.status === 'ON_BREAK');

        if (isWorking && activePunchIn) {
          const liveSec = Math.floor((Date.now() - new Date(activePunchIn).getTime()) / 1000);
          setWorkingSeconds(Math.max(0, pastSessionsSec + liveSec));
        } else if (todayLog.totalHours) {
          setWorkingSeconds(Math.floor(todayLog.totalHours * 3600));
        } else {
          setWorkingSeconds(Math.max(0, pastSessionsSec));
        }
      }
    } catch (err) {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      setLogs([
        { _id: '1', date: today.toISOString(), punchIn: new Date(today.setHours(9, 15)).toISOString(), punchOut: null, status: 'PRESENT', totalHours: 0 },
        { _id: '2', date: yesterday.toISOString(), punchIn: new Date(yesterday.setHours(9, 45)).toISOString(), punchOut: new Date(yesterday.setHours(18, 45)).toISOString(), status: 'LATE', totalHours: 9 },
      ]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchBirthdays = async () => {
    setLoadingBirthdays(true);
    try {
      const res = await axiosClient.get('/employees/birthdays');
      setBirthdays(res.data?.data || res.data || []);
    } catch (err) {
      // Ignore if it fails silently
    } finally {
      setLoadingBirthdays(false);
    }
  };

  const handleCorrectionRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqReason.trim()) {
      toast.error('Reason is mandatory for attendance correction request!');
      return;
    }

    setSubmittingReq(true);
    try {
      const res = await axiosClient.post('/attendance/request-correction', {
        requestedCheckIn: reqCheckIn,
        requestedCheckOut: reqCheckOut,
        reason: reqReason.trim(),
        date: new Date().toISOString()
      });

      if (res.success) {
        toast.success('Attendance correction request sent to Admin!');
        setCorrectionModalOpen(false);
        setReqReason('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit correction request');
    } finally {
      setSubmittingReq(false);
    }
  };

  const openWishDialog = (emp) => {
    setWishEmp(emp);
    setWishMessage(suggestedMessages[0]);
    setWishDialog(true);
  };

  const handleSendWish = async () => {
    if (!wishEmp || !wishMessage.trim()) return;
    setWishing(wishEmp._id);
    try {
      await axiosClient.post('/notifications/send', {
        title: 'ðŸŽ‰ Happy Birthday!',
        message: wishMessage,
        type: 'BIRTHDAY_WISH',
        recipient: wishEmp._id,
        sender: reduxUser.employeeRef?._id
      });
      toast.success('Birthday wish sent successfully!');
      setWishDialog(false);
    } catch (err) {
      toast.error('Failed to send wish');
    } finally {
      setWishing(null);
    }
  };

  const handlePunchIn = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const payload = {
          platform: 'web',
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Web Location'
          }
        };
        await axiosClient.post('/attendance/punch-in', payload);
        toast.success('Punched In Successfully');
        setIsCheckedIn(true);
        setIsOnBreak(false);
        setWorkingSeconds(0);
        setBreakSeconds(0);
        saveTimerState(true, false, 0, 0);
        fetchLogs();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to Punch In');
      }
    }, (error) => {
      toast.error('Please allow location access to punch in');
    });
  };

  const handlePunchOut = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const payload = {
          platform: 'web',
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        };
        await axiosClient.post('/attendance/punch-out', payload);
        toast.success('Punched Out Successfully');
        setIsCheckedIn(false);
        setIsOnBreak(false);
        saveTimerState(false, false, workingSeconds, breakSeconds);
        localStorage.removeItem(`emp_punch_state_${user.empId}`);
        fetchLogs();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to Punch Out');
      }
    }, (error) => {
      toast.error('Please allow location access to punch out');
    });
  };

  const handleToggleBreak = async () => {
    const nextBreak = !isOnBreak;
    try {
      await axiosClient.put('/attendance/toggle-break', { isOnBreak: nextBreak });
      setIsOnBreak(nextBreak);
      saveTimerState(true, nextBreak, workingSeconds, breakSeconds);
      toast.success(nextBreak ? 'Break Started' : 'Welcome Back!');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to update break status on server');
    }
  };

  const formatTimeFull = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getFilteredLogs = () => {
    if (!logs) return [];
    const now = new Date();
    return logs.filter(l => {
      const logDate = new Date(l.date);
      if (historyTab === 0) {
        return (now - logDate) < (7 * 24 * 60 * 60 * 1000);
      } else if (historyTab === 1) {
        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      } else if (historyTab === 2) {
        return logDate.getFullYear() === now.getFullYear();
      } else if (historyTab === 3) {
        if (!customDateStart || !customDateEnd) return true;
        const start = new Date(customDateStart);
        const end = new Date(customDateEnd);
        end.setHours(23, 59, 59, 999);
        return logDate >= start && logDate <= end;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredLogs = getFilteredLogs();

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', p: { xs: 1, md: 2 } }}>
      
      {/* HEADER ABOVE CARD */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.5px', color: '#0F172A' }}>
          Hello, {(user.name || 'Employee').split(' ')[0]}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>
          Hope you're having a productive day!
        </Typography>
      </Box>

      {/* 1. HERO LIVE HUB */}
      <Paper sx={{
        position: 'relative', overflow: 'hidden', mb: 4, p: { xs: 3, md: 4 }, borderRadius: '24px',
        background: '#FFFFFF',
        color: '#0F172A',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        border: '1px solid #E2E8F0'
      }}>
        {/* Subtle purple gradient blobs in corners */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />

        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Left Column: Profile Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar src={user.avatar} sx={{ width: 80, height: 80, border: '3px solid #F8FAFC', fontSize: '2.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', bgcolor: '#4F46E5' }}>
                {(user.name || 'E').charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {user.name} <VerifiedIcon sx={{ color: '#8B5CF6', fontSize: '1.2rem' }} />
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
               <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '12px', flex: 1, border: '1px solid #F1F5F9' }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonOutlineIcon sx={{ fontSize: '1rem', color: '#8B5CF6' }} /> Role
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{user.title}</Typography>
               </Box>
               <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '12px', flex: 1, border: '1px solid #F1F5F9' }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DomainIcon sx={{ fontSize: '1rem', color: '#8B5CF6' }} /> Department
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{user.department}</Typography>
               </Box>
            </Box>
          </Grid>

          {/* Middle Column: Timer & Buttons */}
          <Grid item xs={12} md={4} sx={{ borderLeft: { md: '1px dashed #E2E8F0' }, borderRight: { md: '1px dashed #E2E8F0' }, px: { md: 4 } }}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={!isCheckedIn ? "OFFLINE" : isOnBreak ? "ON BREAK" : "WORKING LIVE"}
                icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: !isCheckedIn ? '#94A3B8' : isOnBreak ? '#F59E0B' : '#10B981', ml: 1 }} />}
                sx={{ bgcolor: '#FFF', color: '#0F172A', fontWeight: 800, mb: 2, px: 1, height: 28, border: '1px solid #E2E8F0', '& .MuiChip-icon': { ml: 1 } }}
              />
              <Typography sx={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, fontFamily: 'monospace', mb: 1, color: isOnBreak ? '#F59E0B' : '#0F172A' }}>
                {formatTimeFull(isOnBreak ? breakSeconds : workingSeconds)}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>
                 {isOnBreak ? 'Total Break Duration' : 'Active Working Hours'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {!isCheckedIn ? (
                   <Button variant="contained" onClick={handlePunchIn} sx={{ bgcolor: '#4F46E5', color: '#FFF', borderRadius: '8px', py: 1, px: 4, fontSize: '0.9rem', fontWeight: 700, '&:hover': { bgcolor: '#4338CA' }, boxShadow: 'none' }}>
                     PUNCH IN
                   </Button>
                ) : (
                  <>
                     <Button variant="contained" onClick={handlePunchOut} sx={{ bgcolor: '#8B5CF6', color: '#FFF', borderRadius: '8px', py: 1, px: 3, fontSize: '0.85rem', fontWeight: 700, '&:hover': { bgcolor: '#7C3AED' }, boxShadow: 'none', display: 'flex', gap: 1 }}>
                       <Box sx={{ width: 8, height: 8, bgcolor: '#FFF', borderRadius: '1px' }} /> Punch Out
                     </Button>
                     <Button variant="outlined" onClick={handleToggleBreak} sx={{ borderWidth: '1px', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '8px', py: 1, px: 3, fontSize: '0.85rem', fontWeight: 700, '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }, display: 'flex', gap: 1 }}>
                       <CoffeeIcon sx={{ fontSize: '1rem' }} /> {isOnBreak ? 'Resume Work' : 'Take Break'}
                     </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Right Column: 2x2 Grid Stats */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Stat 1: Check In */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCodeScannerIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Check In</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                      {logs && logs.length > 0 && logs[0].punchIn ? new Date(logs[0].punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Stat 2: Today's Status */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Today's Status</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                      {logs && logs.length > 0 ? logs[0].status : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Stat 3: Work Hours */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Work Hours</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                        {formatTimeFull(workingSeconds).split(':')[0]}h {formatTimeFull(workingSeconds).split(':')[1]}m
                      </Typography>
                      {isCheckedIn && !isOnBreak && <Chip label="Live" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 700 }} />}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              {/* Stat 4: Location */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Location</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                      Mohali, Punjab
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* BOTTOM SECTION */}
      <Grid container spacing={3}>
        {/* Left Column: Attendance Logs */}
        <Grid item xs={12} lg={7.5}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Box sx={{ p: { xs: 3, md: 4 }, pb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarMonthIcon sx={{ color: '#8B5CF6', fontSize: '1.2rem' }} />
                </Box>
                Attendance Logs
              </Typography>
              
              <Tabs value={historyTab} onChange={(e, v) => setHistoryTab(v)} sx={{ minHeight: 32, '& .MuiTabs-indicator': { display: 'none' }, '& .MuiTab-root': { zIndex: 2, textTransform: 'none', fontWeight: 600, minHeight: 28, py: 0.5, px: 2.5, borderRadius: '20px', color: '#64748B', '&.Mui-selected': { color: '#FFF', bgcolor: '#8B5CF6' }, transition: 'all 0.3s' } }}>
                <Tab label="Daily" />
                <Tab label="Monthly" />
                <Tab label="Yearly" />
                <Tab label="Custom" />
              </Tabs>
            </Box>

            {historyTab === 3 && (
              <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                 <TextField type="date" label="Start Date" size="small" InputLabelProps={{ shrink: true }} value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} sx={{ bgcolor: '#FFF', borderRadius: 1 }} />
                 <Typography sx={{ color: '#94A3B8', fontWeight: 700 }}>to</Typography>
                 <TextField type="date" label="End Date" size="small" InputLabelProps={{ shrink: true }} value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} sx={{ bgcolor: '#FFF', borderRadius: 1 }} />
                 <Button variant="contained" sx={{ bgcolor: '#4F46E5', boxShadow: 'none', fontWeight: 700, borderRadius: '8px', textTransform: 'none', px: 3, py: 1 }}>Apply Filter</Button>
              </Box>
            )}

            <TableContainer sx={{ px: 2 }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', py: 2, px: 3, borderBottom: 'none' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', py: 2, borderBottom: 'none' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', py: 2, borderBottom: 'none' }}>Punch In</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', py: 2, borderBottom: 'none' }}>Punch Out</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase', py: 2, px: 3, textAlign: 'right', borderBottom: 'none' }}>Work Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingLogs ? (
                     [1, 2, 3].map(i => (
                       <TableRow key={i}>
                         <TableCell sx={{ px: 3, borderBottom: '1px solid #F8FAFC' }}><Skeleton width={120} height={24} /></TableCell>
                         <TableCell sx={{ borderBottom: '1px solid #F8FAFC' }}><Skeleton width={70} height={24} /></TableCell>
                         <TableCell sx={{ borderBottom: '1px solid #F8FAFC' }}><Skeleton width={60} height={24} /></TableCell>
                         <TableCell sx={{ borderBottom: '1px solid #F8FAFC' }}><Skeleton width={60} height={24} /></TableCell>
                         <TableCell sx={{ px: 3, textAlign: 'right', borderBottom: '1px solid #F8FAFC' }}><Skeleton width={40} height={24} sx={{ ml: 'auto' }} /></TableCell>
                       </TableRow>
                     ))
                  ) : filteredLogs.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>
                          <ErrorOutlineIcon sx={{ fontSize: '2.5rem', mb: 1, opacity: 0.5 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#475569' }}>No history found</Typography>
                       </TableCell>
                     </TableRow>
                  ) : (
                     filteredLogs.slice(0, 5).map((row, i) => (
                       <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F8FAFC' }, transition: 'background 0.2s' }}>
                         <TableCell sx={{ fontWeight: 800, color: '#0F172A', px: 3, py: 2, borderBottom: '1px solid #F8FAFC' }}>
                           {new Date(row.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                         </TableCell>
                         <TableCell sx={{ py: 2, borderBottom: '1px solid #F8FAFC' }}>
                           <Chip 
                             label={row.status} 
                             size="small" 
                             sx={{ 
                               fontWeight: 800, fontSize: '0.65rem', height: 22, px: 0.5, letterSpacing: '0.5px',
                               bgcolor: row.status === 'PRESENT' ? '#ECFDF5' : row.status === 'LATE' ? '#FFFBEB' : '#FEF2F2',
                               color: row.status === 'PRESENT' ? '#10B981' : row.status === 'LATE' ? '#F59E0B' : '#EF4444',
                             }} 
                           />
                         </TableCell>
                         <TableCell sx={{ color: '#64748B', fontWeight: 600, py: 2, borderBottom: '1px solid #F8FAFC', fontSize: '0.85rem' }}>
                           {row.punchIn ? new Date(row.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                         </TableCell>
                         <TableCell sx={{ color: '#64748B', fontWeight: 600, py: 2, borderBottom: '1px solid #F8FAFC', fontSize: '0.85rem' }}>
                           {row.punchOut ? new Date(row.punchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                         </TableCell>
                         <TableCell sx={{ fontWeight: 900, color: '#0F172A', fontSize: '0.95rem', px: 3, py: 2, textAlign: 'right', borderBottom: '1px solid #F8FAFC' }}>
                           {row.totalHours ? `${row.totalHours.toFixed(2)}h` : '-'}
                         </TableCell>
                       </TableRow>
                     ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ textAlign: 'center', p: 3 }}>
               <Button onClick={() => navigate('/attendance')} sx={{ color: '#8B5CF6', fontWeight: 800, textTransform: 'none' }}>View All Logs &rarr;</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Quick Actions & Birthdays */}
        <Grid item xs={12} lg={4.5}>
          {/* Quick Actions */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', mb: 3 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
               <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                 <BoltIcon sx={{ fontSize: '1.2rem' }} />
               </Box>
               <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem' }}>
                 Quick Actions
               </Typography>
             </Box>
             
             <Grid container spacing={2}>
                {[
                  { title: 'Apply Leave', sub: 'Request new leave', icon: <FlightTakeoffIcon sx={{color:'#10B981'}}/>, bg: '#ECFDF5', link: '/leaves' },
                  { title: 'Reimbursements', sub: 'Claim expense & bills', icon: <ReceiptLongIcon sx={{color:'#3B82F6'}}/>, bg: '#EFF6FF', link: '/reimbursements' },
                  { title: 'Correction Request', sub: 'Request punch edit', icon: <EditCalendarIcon sx={{color:'#EC4899'}}/>, bg: '#FCE7F3', action: () => setCorrectionModalOpen(true) },
                  { title: 'Payslip', sub: 'View salary slips', icon: <AccountBalanceWalletIcon sx={{color:'#F59E0B'}}/>, bg: '#FFFBEB', link: '/payroll' }
                ].map((action, i) => (
                  <Grid item xs={6} key={i}>
                    <Box onClick={() => action.action ? action.action() : navigate(action.link)} sx={{ p: 2, borderRadius: '16px', border: '1px solid #F1F5F9', transition: 'all 0.2s', '&:hover': { borderColor: '#E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }, cursor: 'pointer' }}>
                       <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                          {action.icon}
                       </Box>
                       <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>{action.title}</Typography>
                       <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600 }}>{action.sub}</Typography>
                    </Box>
                  </Grid>
                ))}
             </Grid>
          </Paper>

          {/* Upcoming Birthdays */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <CakeIcon sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem' }}>
                  Upcoming Birthdays
                </Typography>
              </Box>
              <Button sx={{ color: '#8B5CF6', fontWeight: 800, fontSize: '0.8rem', textTransform: 'none' }}>View All</Button>
            </Box>

            {loadingBirthdays ? (
               [1, 2].map(i => (
                 <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                   <Skeleton variant="circular" width={48} height={48} />
                   <Box sx={{ flex: 1 }}>
                     <Skeleton width="60%" height={24} />
                     <Skeleton width="40%" height={20} />
                   </Box>
                 </Box>
               ))
            ) : birthdays.length === 0 ? (
               <Typography sx={{ color: '#94A3B8', fontWeight: 600, textAlign: 'center', py: 4 }}>
                 No upcoming birthdays this month.
               </Typography>
            ) : (
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 {birthdays.map(emp => {
                    const isToday = emp.isToday;
                    const dateText = isToday ? 'Today 🎉' : (emp.formattedDate || (emp.daysUntil ? `In ${emp.daysUntil} days` : 'Upcoming'));
                    return (
                      <Box key={emp._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '16px', border: '1px solid #F1F5F9', transition: 'all 0.2s', '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <Avatar src={emp.avatar} sx={{ width: 48, height: 48, fontWeight: 800, bgcolor: '#8B5CF6' }}>
                          {emp.firstName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{emp.firstName} {emp.lastName}</Typography>
                          <Typography sx={{ color: isToday ? '#10B981' : '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>
                            {dateText}
                          </Typography>
                        </Box>
                        <IconButton onClick={() => openWishDialog(emp)} sx={{ bgcolor: '#8B5CF6', color: '#FFF', width: 32, height: 32, '&:hover': { bgcolor: '#7C3AED' } }}>
                          <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>
                   );
                 })}
               </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Wish Dialog */}
      <Dialog open={wishDialog} onClose={() => setWishDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Send Birthday Wish</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#64748B', fontWeight: 600 }}>
            Send a warm wish to {wishEmp?.firstName}!
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {suggestedMessages.map((msg, i) => (
              <Chip key={i} label={msg.substring(0, 30) + '...'} onClick={() => setWishMessage(msg)} sx={{ bgcolor: wishMessage === msg ? '#EEF2FF' : '#F8FAFC', color: wishMessage === msg ? '#4F46E5' : '#64748B', border: '1px solid', borderColor: wishMessage === msg ? '#C7D2FE' : '#E2E8F0', fontWeight: 600, '&:hover': { bgcolor: '#EEF2FF' } }} />
            ))}
          </Box>
          <TextField fullWidth multiline rows={3} placeholder="Write a custom wish..." value={wishMessage} onChange={(e) => setWishMessage(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setWishDialog(false)} sx={{ color: '#64748B', fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSendWish} disabled={wishing === wishEmp?._id} variant="contained" sx={{ bgcolor: '#4F46E5', color: '#FFF', fontWeight: 700, borderRadius: '8px', boxShadow: 'none', '&:hover': { bgcolor: '#4338CA' } }}>
            {wishing === wishEmp?._id ? 'Sending...' : 'Send Wish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ATTENDANCE CORRECTION REQUEST MODAL DIALOG */}
      <Dialog open={correctionModalOpen} onClose={() => setCorrectionModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          ⏰ Request Attendance Correction
        </DialogTitle>
        <form onSubmit={handleCorrectionRequestSubmit}>
          <DialogContent sx={{ pt: 2.5, pb: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 2 }}>
              Forgot to punch in or late due to a valid issue? Submit a correction request with a mandatory reason for Admin approval.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Requested Check-In Time <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g. 09:02 AM"
                value={reqCheckIn}
                onChange={(e) => setReqCheckIn(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Requested Check-Out Time (Optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 06:00 PM"
                value={reqCheckOut}
                onChange={(e) => setReqCheckOut(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Reason for Correction <span style={{ color: '#EF4444' }}>* (Mandatory)</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                required
                placeholder="Explain reason (e.g. Technical error at gate entrance, Client call, Traffic delay)..."
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
            <Button onClick={() => setCorrectionModalOpen(false)} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submittingReq} sx={{ bgcolor: '#4F46E5', color: '#FFF', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#4338CA' } }}>
              {submittingReq ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
