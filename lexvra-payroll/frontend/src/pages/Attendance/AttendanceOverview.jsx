import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Chip, IconButton, Skeleton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CelebrationIcon from '@mui/icons-material/Celebration';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { FormControlLabel, Switch } from '@mui/material';

// --- Premium UI Components ---

const GlassCard = ({ children, sx }) => (
  <Paper elevation={0} sx={{
    bgcolor: '#FFFFFF', borderRadius: '24px', border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0px 10px 30px rgba(112, 144, 176, 0.08)', overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0px 15px 35px rgba(112, 144, 176, 0.12)' },
    ...sx
  }}>
    {children}
  </Paper>
);

const StatCard = ({ title, value, subtitle, icon: Icon, color, sparklineData }) => (
  <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 200 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
          <Icon sx={{ fontSize: '1.5rem' }} />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, display: 'block', mb: 0.2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
          <Typography variant="h4" sx={{ color: '#1B254B', fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
        </Box>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
       <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>
         {subtitle}
       </Typography>
       <Box sx={{ width: 60, height: 20, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
         {sparklineData.map((d, i) => (
           <Box key={i} sx={{ width: 6, height: `${d.v}%`, bgcolor: color, borderRadius: '2px', opacity: 0.3 + (i * 0.2) }} />
         ))}
       </Box>
    </Box>
  </GlassCard>
);

const AttendanceOverview = () => {
  const user = useSelector((state) => state.auth.user);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // History Modal State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [historyTab, setHistoryTab] = useState(1);

  // Settings Modal State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    attendanceWebEnabled: true,
    attendanceMobileEnabled: true,
    geofencingEnabled: false,
    geofencingRadius: 200,
    geofencingLat: 30.7046,
    geofencingLng: 76.7179
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        axiosClient.get('/employees').catch(() => null),
        axiosClient.get('/attendance/logs').catch(() => null)
      ]);
      const empList = Array.isArray(empRes?.data) ? empRes.data : Array.isArray(empRes) ? empRes : [];
      setEmployees(empList);

      const allLogs = attRes?.data?.data || attRes?.data || attRes || [];
      
      // Combine properly so every log has full employee details
      const enrichedLogs = allLogs.map(log => {
        let empData = log.employee;
        if (typeof log.employee === 'string' || !log.employee?.firstName) {
           const found = empList.find(e => e._id === (log.employee?._id || log.employee));
           if (found) empData = found;
        }
        return { ...log, employee: empData };
      }).filter(log => log.employee && log.employee.firstName); // Filter out unpopulated/deleted employee logs

      const isAdmin = ['admin', 'superadmin'].includes(user?.role?.toLowerCase());
      
      // Show all if admin, else filter strictly by current user
      if (isAdmin) {
         setLogs(enrichedLogs);
      } else {
         const myLogs = enrichedLogs.filter(log => {
           const logEmpId = String(log.employee?._id || log.employee);
           const userEmpRef = String(user?.employeeRef?._id || user?.employeeRef);
           const userId = String(user?._id);
           return logEmpId === userEmpRef || logEmpId === userId;
         });
         setLogs(myLogs); // Strict assignment, NEVER fallback to all logs
      }
    } catch (err) {
      console.log('Failed to fetch attendance logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings');
      const s = res.data?.data || res.data;
      if (s) {
        setSettingsForm({
          attendanceWebEnabled: s.attendanceWebEnabled ?? true,
          attendanceMobileEnabled: s.attendanceMobileEnabled ?? true,
          geofencingEnabled: s.geofencingEnabled ?? false,
          geofencingRadius: s.geofencingRadius || 200,
          geofencingLat: s.geofencingLat || 30.7046,
          geofencingLng: s.geofencingLng || 76.7179
        });
      }
      setSettingsOpen(true);
    } catch (err) {
      toast.error('Failed to fetch settings');
    }
  };

  const saveSettings = async () => {
    try {
      await axiosClient.put('/settings', settingsForm);
      toast.success('Attendance Permissions Updated Successfully!');
      setSettingsOpen(false);
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handlePrevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'));

  // Calculate dynamic stats for the current month
  const monthLogs = logs.filter(log => log.punchIn && dayjs(log.punchIn).isSame(currentMonth, 'month'));
  const presentDays = monthLogs.filter(l => l.status === 'PRESENT' || l.status === 'WORKING').length;
  const absentDays = monthLogs.filter(l => l.status === 'ABSENT').length;
  const leaveDays = monthLogs.filter(l => l.status === 'ON_LEAVE' || l.status === 'TIME_OFF').length;
  const halfDays = monthLogs.filter(l => l.status === 'HALF_DAY').length;
  const weekOffs = 4; // Mocked

  // Get days for the calendar
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day(); // 0 is Sunday
  const calendarDays = [];
  
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(currentMonth.date(i));
  }

  const getStatusForDate = (date) => {
    if (!date) return null;
    const log = logs.find(l => l.punchIn && dayjs(l.punchIn).isSame(date, 'day'));
    return log ? log.status : null;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return '#01B574';
      case 'WORKING': return '#01B574';
      case 'ABSENT': return '#E31A1A';
      case 'ON_LEAVE': return '#FFB547';
      case 'TIME_OFF': return '#FFB547';
      case 'HALF_DAY': return '#4318FF';
      default: return 'transparent';
    }
  };

  const getStatusChip = (status) => {
    const s = status?.toUpperCase() || 'ABSENT';
    const config = {
      PRESENT: { bg: '#E2FFE9', color: '#01B574', label: 'Present' },
      WORKING: { bg: '#E2FFE9', color: '#01B574', label: 'Working' },
      ABSENT: { bg: '#FFE2E5', color: '#E31A1A', label: 'Absent' },
      ON_LEAVE: { bg: '#FFF5D8', color: '#FFB547', label: 'On Leave' },
      TIME_OFF: { bg: '#FFF5D8', color: '#FFB547', label: 'On Leave' },
      HALF_DAY: { bg: '#E9EDF7', color: '#4318FF', label: 'Half Day' },
      LATE: { bg: '#FFE2E5', color: '#E31A1A', label: 'Late' }
    };
    const c = config[s] || config.ABSENT;
    return <Chip label={c.label} sx={{ bgcolor: c.bg, color: c.color, fontWeight: 800, borderRadius: '8px', px: 1, height: 28, fontSize: '0.75rem' }} />;
  };

  const upcomingFestivals = [
    { name: 'Independence Day', date: 'Aug 15, 2026', day: 'Saturday' },
    { name: 'Raksha Bandhan', date: 'Aug 28, 2026', day: 'Friday' },
    { name: 'Diwali', date: 'Nov 01, 2026', day: 'Sunday' }
  ];

  const handleOpenHistory = (emp) => {
    setSelectedEmp(emp);
    setHistoryOpen(true);
  };

  const isAdmin = ['admin', 'superadmin'].includes(user?.role?.toLowerCase());

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F4F7FE', p: { xs: 2, md: 4 } }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 5, gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B254B', letterSpacing: '-1px' }}>
            {isAdmin ? 'Organization Attendance' : 'My Attendance Logs'}
          </Typography>
          <Typography variant="h6" sx={{ color: '#A3AED0', fontWeight: 500, mt: 0.5 }}>
            Track daily check-in times, leaves, and working duration.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAdmin && (
            <Button variant="contained" startIcon={<SettingsIcon />} onClick={() => fetchSettings()} sx={{ borderRadius: '16px', fontWeight: 700, textTransform: 'none', px: 3, py: 1.5, bgcolor: '#4318FF', boxShadow: '0 4px 15px rgba(67, 24, 255, 0.3)' }}>
              Permissions
            </Button>
          )}
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={{ borderRadius: '16px', borderColor: '#E2E8F0', color: '#1B254B', fontWeight: 700, textTransform: 'none', px: 3, py: 1.5, bgcolor: '#FFFFFF' }}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <StatCard title="Present Days" value={loading ? '-' : presentDays} subtitle="This Month" icon={EventAvailableOutlinedIcon} color="#05CD99" sparklineData={[{v:40}, {v:60}, {v:80}, {v:100}]} />
        <StatCard title="Absent Days" value={loading ? '-' : absentDays} subtitle="This Month" icon={CancelOutlinedIcon} color="#EE5D50" sparklineData={[{v:20}, {v:10}, {v:5}, {v:0}]} />
        <StatCard title="Approved Leaves" value={loading ? '-' : leaveDays} subtitle="This Month" icon={BeachAccessOutlinedIcon} color="#FFCE20" sparklineData={[{v:10}, {v:10}, {v:10}, {v:10}]} />
        <StatCard title="Half Days" value={loading ? '-' : halfDays} subtitle="This Month" icon={AccessTimeOutlinedIcon} color="#4318FF" sparklineData={[{v:20}, {v:40}, {v:30}, {v:10}]} />
        <StatCard title="Week Offs" value={loading ? '-' : weekOffs} subtitle="This Month" icon={CheckCircleOutlinedIcon} color="#39B8FF" sparklineData={[{v:100}, {v:100}, {v:100}, {v:100}]} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Interactive Calendar & Upcoming Festivals */}
        <Grid item xs={12} lg={3.5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            
            {/* Interactive Calendar Card */}
            <GlassCard sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B' }}>
                  {currentMonth.format('MMMM YYYY')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={handlePrevMonth} sx={{ bgcolor: '#F4F7FE', borderRadius: '12px' }}><ChevronLeftIcon /></IconButton>
                  <IconButton onClick={handleNextMonth} sx={{ bgcolor: '#F4F7FE', borderRadius: '12px' }}><ChevronRightIcon /></IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 2 }}>
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                  <Typography key={d} variant="caption" sx={{ fontWeight: 800, color: '#A3AED0' }}>{d}</Typography>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
                {calendarDays.map((date, i) => {
                  if (!date) return <Box key={`empty-${i}`} />;
                  const isSelected = selectedDate.isSame(date, 'day');
                  const isToday = dayjs().isSame(date, 'day');
                  const status = getStatusForDate(date);
                  const indicatorColor = getStatusColor(status);

                  return (
                    <Box key={date.format('DD')} onClick={() => setSelectedDate(date)} sx={{
                      height: 40, borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                      bgcolor: isSelected ? '#4318FF' : isToday ? '#F4F7FE' : 'transparent',
                      color: isSelected ? '#FFFFFF' : isToday ? '#4318FF' : '#1B254B',
                      fontWeight: (isSelected || isToday) ? 900 : 700,
                      '&:hover': { bgcolor: isSelected ? '#4318FF' : '#F4F7FE' }
                    }}>
                      {date.format('D')}
                      {indicatorColor !== 'transparent' && !isSelected && (
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: indicatorColor, position: 'absolute', bottom: 4 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #F4F7FE' }}>
                {[{l: 'Present', c: '#01B574'}, {l: 'Absent', c: '#E31A1A'}, {l: 'Half Day', c: '#4318FF'}, {l: 'Leave', c: '#FFB547'}].map(item => (
                  <Box key={item.l} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '4px', bgcolor: item.c }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#A3AED0' }}>{item.l}</Typography>
                  </Box>
                ))}
              </Box>
            </GlassCard>

            {/* Upcoming Festivals Card */}
            <GlassCard sx={{ p: 4, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#FFF5D8', color: '#FFB547', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CelebrationIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B' }}>Upcoming Holidays</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {upcomingFestivals.map((fest, idx) => (
                  <Box key={idx} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F4F7FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: '#F9FAFD', borderColor: '#E2E8F0' } }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1B254B' }}>{fest.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>{fest.day}</Typography>
                    </Box>
                    <Chip label={fest.date} sx={{ bgcolor: '#F4F7FE', color: '#4318FF', fontWeight: 800, borderRadius: '10px' }} />
                  </Box>
                ))}
              </Box>
            </GlassCard>

          </Box>
        </Grid>

        {/* Right Column: Attendance Log Table */}
        <Grid item xs={12} lg={8.5}>
          <GlassCard sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
              <Box>
                 <Typography variant="h5" sx={{ fontWeight: 900, color: '#1B254B', mb: 0.5 }}>Monthly Attendance Log</Typography>
                 <Typography variant="body2" sx={{ color: '#A3AED0', fontWeight: 600 }}>Showing records for {currentMonth.format('MMMM YYYY')}</Typography>
              </Box>
            </Box>

            <TableContainer sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #F4F7FE', flexGrow: 1 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    {(isAdmin ? ['EMPLOYEE', 'DATE', 'CHECK IN', 'CHECK OUT', 'HOURS', 'STATUS', 'REMARKS', 'ACTIONS'] : ['DATE', 'CHECK IN', 'CHECK OUT', 'HOURS', 'STATUS', 'REMARKS', 'ACTIONS']).map(th => (
                      <TableCell key={th} sx={{ color: '#A3AED0', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 0.5, borderBottom: 'none', py: 2.5 }}>{th}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: isAdmin ? 8 : 7 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderBottom: '1px solid #F4F7FE', py: 2.5 }}><Skeleton height={28} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : monthLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, border: 'none' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <EventAvailableOutlinedIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
                          <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                            No punch records available for {currentMonth.format('MMMM YYYY')}.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthLogs.map((log, idx) => {
                      const emp = log.employee || {};
                      const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
                      const empId = emp.employeeId || `LX${String(idx + 1).padStart(3, '0')}`;
                      const email = emp.email || 'No email provided';
                      return (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F9FAFD' }, transition: 'background 0.2s' }}>
                        {isAdmin && (
                          <TableCell sx={{ borderBottom: '1px solid #F4F7FE', py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 44, height: 44, bgcolor: '#4318FF', color: '#FFF', fontWeight: 800 }}>
                                {name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ color: '#1B254B', fontWeight: 800 }}>{name}</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700 }}>{empId} • {email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: '#1B254B', fontWeight: 900 }}>
                          {dayjs(log.punchIn || new Date()).format('MMM DD, YYYY')}
                          <Typography variant="caption" sx={{ color: '#A3AED0', display: 'block', fontWeight: 700 }}>
                            {dayjs(log.punchIn || new Date()).format('dddd')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: log.punchIn ? '#01B574' : '#A3AED0', fontWeight: 800, fontSize: '0.9rem' }}>
                          {log.punchIn ? dayjs(log.punchIn).format('hh:mm A') : '—'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: log.punchOut ? '#4318FF' : '#A3AED0', fontWeight: 800, fontSize: '0.9rem' }}>
                          {log.punchOut ? dayjs(log.punchOut).format('hh:mm A') : '—'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: '#1B254B', fontWeight: 900 }}>
                          {log.totalHours ? `${log.totalHours}h` : '—'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE' }}>
                          {getStatusChip(log.status)}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE', color: '#A3AED0', fontWeight: 600 }}>
                          {log.remarks || '—'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F4F7FE' }}>
                          <Button size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon />} 
                            onClick={() => handleOpenHistory({
                              name, 
                              empId, 
                              email, 
                              initial: name.charAt(0),
                              joiningDate: emp.joiningDate ? dayjs(emp.joiningDate).format('MMM DD, YYYY') : 'N/A',
                              department: emp.department?.name || 'N/A',
                              designation: emp.designation?.title || 'N/A'
                            })}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: '#4318FF', borderColor: '#4318FF55', '&:hover': { bgcolor: '#F4F7FE' } }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
      </Grid>

      {/* --- Attendance History Modal --- */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#4318FF', fontWeight: 800 }}>{selectedEmp?.initial}</Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B' }}>{selectedEmp?.name}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>{selectedEmp?.empId} • {selectedEmp?.email}</Typography>
            </Box>
          </Box>
          <Button onClick={() => setHistoryOpen(false)} sx={{ minWidth: 0, p: 1, color: '#A3AED0' }}><CancelOutlinedIcon /></Button>
        </Box>
        
        <Box sx={{ px: 3, pt: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Tabs value={historyTab} onChange={(e, v) => setHistoryTab(v)} sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.9rem', color: '#A3AED0' }, '& .Mui-selected': { color: '#4318FF !important' }, '& .MuiTabs-indicator': { bgcolor: '#4318FF', height: 3, borderRadius: '3px 3px 0 0' } }}>
            <Tab label="Daily View" value={0} />
            <Tab label="Monthly Overview" value={1} />
            <Tab label="Yearly Summary" value={2} />
            <Tab label="Custom Range" value={3} />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 4, minHeight: 300, bgcolor: '#F4F7FE' }}>
          
          {/* Employee Information Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 4, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, border: '1px solid #E2E8F0' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, textTransform: 'uppercase' }}>Department</Typography>
              <Typography variant="subtitle1" sx={{ color: '#1B254B', fontWeight: 800 }}>{selectedEmp?.department}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, textTransform: 'uppercase' }}>Designation</Typography>
              <Typography variant="subtitle1" sx={{ color: '#1B254B', fontWeight: 800 }}>{selectedEmp?.designation}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, textTransform: 'uppercase' }}>Joining Date</Typography>
              <Typography variant="subtitle1" sx={{ color: '#1B254B', fontWeight: 800 }}>{selectedEmp?.joiningDate}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, textTransform: 'uppercase' }}>Employment Status</Typography>
              <Chip label="Active" sx={{ bgcolor: '#E2FFE9', color: '#01B574', fontWeight: 800, borderRadius: '8px', height: 24, mt: 0.5 }} />
            </Box>
          </Paper>

          {historyTab === 3 && (
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField type="date" size="small" label="From Date" InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFF' } }} />
              <TextField type="date" size="small" label="To Date" InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFF' } }} />
              <Button variant="contained" sx={{ borderRadius: '12px', bgcolor: '#4318FF', fontWeight: 800, textTransform: 'none', px: 4 }}>Fetch History</Button>
            </Box>
          )}

          <TableContainer sx={{ border: '1px solid #F4F7FE', borderRadius: '16px', overflow: 'hidden' }}>
             <Table size="small">
               <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                 <TableRow>
                   {['DATE', 'CHECK IN', 'CHECK OUT', 'HOURS', 'STATUS'].map(t => <TableCell key={t} sx={{ fontWeight: 800, color: '#A3AED0', py: 1.5 }}>{t}</TableCell>)}
                 </TableRow>
               </TableHead>
               <TableBody>
                 {[
                   { d: 'Jul 30, 2026', ci: '09:15 AM', co: '06:12 PM', h: '8h 57m', s: 'PRESENT' },
                   { d: 'Jul 29, 2026', ci: '09:20 AM', co: '06:15 PM', h: '8h 55m', s: 'PRESENT' },
                   { d: 'Jul 28, 2026', ci: '—', co: '—', h: '—', s: 'ON_LEAVE' },
                   { d: 'Jul 27, 2026', ci: '09:40 AM', co: '06:30 PM', h: '8h 50m', s: 'LATE' },
                   { d: 'Jul 26, 2026', ci: '—', co: '—', h: '—', s: 'ABSENT' },
                 ].map((r, i) => (
                   <TableRow key={i} sx={{ '&:hover': { bgcolor: '#F9FAFD' } }}>
                     <TableCell sx={{ borderBottom: '1px solid #F4F7FE', fontWeight: 800, color: '#1B254B', py: 1.5 }}>{r.d}</TableCell>
                     <TableCell sx={{ borderBottom: '1px solid #F4F7FE', fontWeight: 700, color: r.ci !== '—' ? '#01B574' : '#A3AED0' }}>{r.ci}</TableCell>
                     <TableCell sx={{ borderBottom: '1px solid #F4F7FE', fontWeight: 700, color: r.co !== '—' ? '#4318FF' : '#A3AED0' }}>{r.co}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F4F7FE', fontWeight: 800, color: '#1B254B' }}>{r.h}</TableCell>
                     <TableCell sx={{ borderBottom: '1px solid #F4F7FE' }}>{getStatusChip(r.s)}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', boxShadow: '0px 20px 40px rgba(0,0,0,0.1)' } }}>
        <Box sx={{ p: 3, bgcolor: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: '#4318FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B' }}>Attendance Permissions</Typography>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>Configure punching limits and Geofencing</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSettingsOpen(false)}><CancelOutlinedIcon /></IconButton>
        </Box>
        
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B', mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>Platform Rules</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1B254B' }}>Allow Web Portal Punching</Typography>
                <Typography variant="body2" sx={{ color: '#A3AED0' }}>Employees can punch in/out using their computer browsers.</Typography>
              </Box>
              <Switch checked={settingsForm.attendanceWebEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, attendanceWebEnabled: e.target.checked })} color="primary" />
            </Paper>

            <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1B254B' }}>Allow Mobile App Swiping</Typography>
                <Typography variant="body2" sx={{ color: '#A3AED0' }}>Employees can punch in/out using the mobile app swipe feature.</Typography>
              </Box>
              <Switch checked={settingsForm.attendanceMobileEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, attendanceMobileEnabled: e.target.checked })} color="primary" />
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B', textTransform: 'uppercase', letterSpacing: '1px' }}>Location Geofencing</Typography>
            <Switch checked={settingsForm.geofencingEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, geofencingEnabled: e.target.checked })} color="secondary" />
          </Box>

          {settingsForm.geofencingEnabled && (
            <Paper elevation={0} sx={{ p: 3, border: '1px dashed #4318FF', borderRadius: '16px', bgcolor: '#F8F9FF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#4318FF' }}>
                <LocationOnIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Office Coordinates (Center)</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Latitude" 
                    type="number" 
                    value={settingsForm.geofencingLat} 
                    onChange={(e) => setSettingsForm({...settingsForm, geofencingLat: parseFloat(e.target.value)})} 
                    InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Longitude" 
                    type="number" 
                    value={settingsForm.geofencingLng} 
                    onChange={(e) => setSettingsForm({...settingsForm, geofencingLng: parseFloat(e.target.value)})} 
                    InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Allowed Radius (Meters)" 
                    type="number" 
                    value={settingsForm.geofencingRadius} 
                    onChange={(e) => setSettingsForm({...settingsForm, geofencingRadius: parseInt(e.target.value)})} 
                    InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 }, endAdornment: <InputAdornment position="end">m</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ color: '#A3AED0', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={() => saveSettings()} sx={{ bgcolor: '#4318FF', borderRadius: '12px', fontWeight: 700, px: 4 }}>Save Configuration</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceOverview;
