import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Avatar, Chip, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogContent, DialogTitle, Checkbox, IconButton, Tooltip
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SaveIcon from '@mui/icons-material/Save';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { generateSalarySlipPDF } from '../../utils/payslipGenerator';

const AdminPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Period Filters
  const [periodType, setPeriodType] = useState('Monthly');
  const [periodMonth, setPeriodMonth] = useState('July 2026');
  const [periodYear, setPeriodYear] = useState('2026');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // States
  const [settings, setSettings] = useState({});
  const [finalized, setFinalized] = useState([]);
  const [customBreakdowns, setCustomBreakdowns] = useState({});
  const [attendanceGrid, setAttendanceGrid] = useState({});
  const [unsavedGrid, setUnsavedGrid] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Drag to fill state
  const [dragState, setDragState] = useState(null); // { val }

  // Modals
  const [settingModalEmp, setSettingModalEmp] = useState(null);
  const [breakdownModalEmp, setBreakdownModalEmp] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  
  // Bulk Settings State
  const [bulkType, setBulkType] = useState('');
  const [bulkOvertime, setBulkOvertime] = useState('');
  const [bulkSelected, setBulkSelected] = useState([]);

  useEffect(() => {
    fetchEmployees();
    const savedSettings = localStorage.getItem('payroll_adv_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const savedFinalized = localStorage.getItem('payroll_adv_finalized');
    if (savedFinalized) setFinalized(JSON.parse(savedFinalized));
    const savedBreakdowns = localStorage.getItem('payroll_adv_breakdowns');
    if (savedBreakdowns) setCustomBreakdowns(JSON.parse(savedBreakdowns));
    const savedAttendance = localStorage.getItem('payroll_adv_attendance');
    if (savedAttendance) {
      setAttendanceGrid(JSON.parse(savedAttendance));
      setUnsavedGrid(JSON.parse(savedAttendance));
    }
  }, []);

  // Global mouse up to stop dragging
  useEffect(() => {
    const handleMouseUp = () => setDragState(null);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get('/employees');
      const emps = res.data.employees || res.data || [];
      const formattedEmps = emps.map(emp => ({
        id: emp._id,
        name: emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : (emp.name || 'Unknown'),
        email: emp.email || '',
        empId: emp.employeeId || emp.employeeRef?.employeeId || 'LX---',
        dept: emp.department?.name || emp.department || 'General',
        role: emp.designation?.title || emp.designation || 'Employee',
        baseSalary: emp.baseSalary || emp.employeeRef?.baseSalary || 37000,
        doj: emp.joiningDate || new Date().toISOString(),
      }));
      setEmployees(formattedEmps);
    } catch (err) {
      console.log('Error fetching employees:', err);
    }
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('payroll_adv_settings', JSON.stringify(newSettings));
  };
  const saveFinalized = (newFinalized) => {
    setFinalized(newFinalized);
    localStorage.setItem('payroll_adv_finalized', JSON.stringify(newFinalized));
  };
  const saveBreakdowns = (newBreakdowns) => {
    setCustomBreakdowns(newBreakdowns);
    localStorage.setItem('payroll_adv_breakdowns', JSON.stringify(newBreakdowns));
  };

  const parsePeriod = () => {
    if (periodType === 'Monthly') {
       const [m, y] = periodMonth.split(' ');
       const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
       const mIdx = monthNames.indexOf(m);
       return { mIdx, mStr: m.substring(0, 3), y: parseInt(y), totalDays: new Date(parseInt(y), mIdx + 1, 0).getDate() };
    }
    return { mIdx: new Date().getMonth(), mStr: 'Cur', y: new Date().getFullYear(), totalDays: 30 };
  };

  const getEmpSetting = (id) => settings[id] || { type: 'COMPLIANCE', overtimeType: 'FIXED', overtimeRate: 500, overtimeMultiplier: 1.5, hourlyRate: 500 };

  const getSimulatedDays = (emp) => {
     const p = parsePeriod();
     
     let gridWorked = 0;
     let hasGridData = false;
     const empGrid = attendanceGrid[emp.id] || {};
     for (let i = 1; i <= p.totalDays; i++) {
        const dateKey = `${p.y}-${p.mIdx+1}-${i}`;
        if (empGrid[dateKey]) hasGridData = true;
        if (empGrid[dateKey] === 'P' || empGrid[dateKey] === 'W') gridWorked++;
     }
     
     if (hasGridData) return { worked: gridWorked, total: p.totalDays };
     
     let dojStr = emp.doj;
     if (dojStr.startsWith('0020')) dojStr = dojStr.replace('0020', '2026');
     const dojDate = new Date(dojStr);

     if (dojDate.getFullYear() > p.y || (dojDate.getFullYear() === p.y && dojDate.getMonth() > p.mIdx)) {
         return { worked: 0, total: p.totalDays };
     }
     if (dojDate.getFullYear() === p.y && dojDate.getMonth() === p.mIdx) {
         const worked = p.totalDays - dojDate.getDate() + 1;
         return { worked: worked > 0 ? worked : 0, total: p.totalDays };
     }
     return { worked: p.totalDays, total: p.totalDays };
  };

  const calculateSalary = (emp) => {
    const empSetting = getEmpSetting(emp.id);
    const baseSalary = emp.baseSalary;
    const { worked: attendanceDays, total: totalDays } = getSimulatedDays(emp);
    
    const totalHours = attendanceDays * 8;
    const custom = customBreakdowns[emp.id] || {};
    let overtimeAmount = custom.overtimeAmount || 0;
    
    let gross = 0; let net = 0; let epf = 0; let tds = 0; let pt = 200;
    
    if (empSetting.type === 'HOURLY') {
       const rate = Number(empSetting.hourlyRate) || 500;
       gross = (totalHours * rate) + overtimeAmount;
       pt = 0;
    } else if (empSetting.type === 'NO_COMPLIANCE') {
       gross = Math.round((baseSalary / totalDays) * attendanceDays) + overtimeAmount;
       pt = 0;
    } else {
       gross = Math.round((baseSalary / totalDays) * attendanceDays) + overtimeAmount;
       epf = Math.round(gross * 0.12);
       const ctc = emp.ctc || (baseSalary * 12);
       if (ctc > 1000000) {
           tds = Math.round(gross * 0.10);
       } else {
           tds = 0;
       }
    }

    if (custom.epf !== undefined) epf = custom.epf;
    if (custom.tds !== undefined) tds = custom.tds;
    if (custom.pt !== undefined) pt = custom.pt;

    const deductions = epf + tds + pt;
    net = gross - deductions;
    
    return { gross: Math.round(gross), deductions: Math.round(deductions), net: Math.round(net), epf, tds, pt, overtimeAmount: Math.round(overtimeAmount), attendanceDays, totalDays, totalHours };
  };

  const handleFinalize = (emp) => {
    const calc = calculateSalary(emp);
    const record = { recordId: Date.now().toString() + emp.id, empId: emp.id, name: emp.name, email: emp.email, dept: emp.dept, role: emp.role, month: periodType === 'Monthly' ? periodMonth : 'Custom', status: 'Finalized', ...calc, baseSalary: emp.baseSalary };
    saveFinalized([...finalized, record]);
    toast.success(`${emp.name}'s salary finalized!`);
  };

  const handleFinalizeAll = () => {
    const unfinalized = employees.filter(emp => !finalized.find(r => r.empId === emp.id));
    if (unfinalized.length === 0) return toast.error('No pending employees to finalize.');
    
    const newRecords = unfinalized.map(emp => {
      const calc = calculateSalary(emp);
      return { recordId: Date.now().toString() + emp.id, empId: emp.id, name: emp.name, email: emp.email, dept: emp.dept, role: emp.role, month: periodType === 'Monthly' ? periodMonth : 'Custom', status: 'Finalized', ...calc, baseSalary: emp.baseSalary };
    });
    saveFinalized([...finalized, ...newRecords]);
    toast.success(`Finalized ${newRecords.length} employees successfully!`);
  };

  const handleDefinalize = (recordId) => {
    saveFinalized(finalized.filter(r => r.recordId !== recordId));
    toast.success('Record moved back to Processing!');
  };

  const handleMarkPaid = (recordId) => {
    saveFinalized(finalized.map(r => r.recordId === recordId ? { ...r, status: 'Paid' } : r));
    toast.success('Salary marked as paid!');
  };

  const applyBulkSettings = () => {
    if (bulkSelected.length === 0) return toast.error('Select employees first!');
    if (!bulkType && !bulkOvertime) return toast.error('Select a setting to apply!');
    
    const newSettings = { ...settings };
    bulkSelected.forEach(empId => {
      const current = getEmpSetting(empId);
      if (bulkType) current.type = bulkType;
      if (bulkOvertime) current.overtimeType = bulkOvertime;
      newSettings[empId] = current;
    });
    saveSettings(newSettings);
    setBulkModalOpen(false);
    setBulkSelected([]);
    toast.success('Bulk settings applied!');
  };

  const handleDownloadPayslip = async (record) => {
    let settings = {};
    try {
      const res = await axiosClient.get('/settings');
      if (res.data?.data) settings = res.data.data;
    } catch (err) {
      console.error('Failed to fetch settings for payslip', err);
    }
    
    generateSalarySlipPDF({
      name: record.name,
      empId: record.empId || 'EMP00X',
      designation: record.role,
      department: record.dept,
      joiningDate: '01 Jan 2024',
      month: record.month,
      basicSalary: record.baseSalary || 37000,
      hra: 0, conveyance: 0, medical: 0, specialAllowance: 0,
      grossEarnings: record.gross,
      totalDeductions: record.deductions,
      epf: record.epf,
      pt: record.pt || 0,
      netPay: record.net
    }, settings);
    toast.success(`Payslip for ${record.name} downloaded successfully!`);
  };

  // ---------------------------
  // Attendance Grid Logic
  // ---------------------------
  const currentPeriod = parsePeriod();
  const daysArr = Array.from({length: currentPeriod.totalDays}, (_, i) => i + 1);

  const getCellColor = (val) => {
     if (val === 'A') return '#FEE2E2'; // Red
     if (val === 'L') return '#FEF9C3'; // Yellow
     if (val === 'W') return '#E2E8F0'; // Gray
     return '#DCFCE7'; // Green (P)
  };

  const getCellText = (val) => {
     if (val === 'A') return '#EF4444';
     if (val === 'L') return '#EAB308';
     if (val === 'W') return '#64748B';
     return '#10B981';
  };

  const handleCellChange = (empId, day, nextVal) => {
     const dateKey = `${currentPeriod.y}-${currentPeriod.mIdx+1}-${day}`;
     const newGrid = { ...unsavedGrid, [empId]: { ...(unsavedGrid[empId] || {}), [dateKey]: nextVal } };
     setUnsavedGrid(newGrid);
     setHasChanges(true);
  };

  const handleSaveAttendance = () => {
     setAttendanceGrid(unsavedGrid);
     localStorage.setItem('payroll_adv_attendance', JSON.stringify(unsavedGrid));
     setHasChanges(false);
     toast.success('Attendance records saved successfully!');
  };

  const unfinalizedEmployees = employees.filter(emp => !finalized.find(r => r.empId === emp.id));

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
      
      {/* Left Sidebar Menu */}
      <Paper elevation={0} sx={{ width: { xs: '100%', lg: '280px' }, flexShrink: 0, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentsIcon sx={{ color: '#4F46E5' }} /> Payroll Hub
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button onClick={() => setActiveTab(0)} sx={{ justifyContent: 'flex-start', px: 2, py: 1.5, borderRadius: '12px', textTransform: 'none', color: activeTab === 0 ? '#4F46E5' : '#475569', bgcolor: activeTab === 0 ? '#EEF2FF' : 'transparent', fontWeight: activeTab === 0 ? 800 : 600 }} startIcon={<MonetizationOnIcon />}>
            Process Payroll
          </Button>
          <Button onClick={() => setActiveTab(1)} sx={{ justifyContent: 'flex-start', px: 2, py: 1.5, borderRadius: '12px', textTransform: 'none', color: activeTab === 1 ? '#4F46E5' : '#475569', bgcolor: activeTab === 1 ? '#EEF2FF' : 'transparent', fontWeight: activeTab === 1 ? 800 : 600 }} startIcon={<DateRangeIcon />}>
            Bulk Attendance
          </Button>
          <Button onClick={() => setActiveTab(2)} sx={{ justifyContent: 'flex-start', px: 2, py: 1.5, borderRadius: '12px', textTransform: 'none', color: activeTab === 2 ? '#4F46E5' : '#475569', bgcolor: activeTab === 2 ? '#EEF2FF' : 'transparent', fontWeight: activeTab === 2 ? 800 : 600 }} startIcon={<TaskAltIcon />}>
            Finalized Payroll
          </Button>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        
        {/* Time Filters Block */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.5 }}>Period Type</Typography>
            <TextField select size="small" value={periodType} onChange={e => setPeriodType(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
              <MenuItem value="Custom">Custom Date</MenuItem>
            </TextField>
          </Box>
          {periodType === 'Monthly' && (
            <TextField select size="small" value={periodMonth} onChange={e => setPeriodMonth(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="July 2026">July 2026</MenuItem>
              <MenuItem value="June 2026">June 2026</MenuItem>
              <MenuItem value="May 2026">May 2026</MenuItem>
            </TextField>
          )}
          {periodType === 'Yearly' && (
            <TextField select size="small" value={periodYear} onChange={e => setPeriodYear(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </TextField>
          )}
        </Paper>

        {/* TAB 0: Process Payroll */}
        {activeTab === 0 && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>Process Payroll</Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setBulkModalOpen(true)} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#CBD5E1', color: '#475569' }}>
                  Global Settings
                </Button>
                <Button variant="contained" startIcon={<DoneAllIcon />} onClick={handleFinalizeAll} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, bgcolor: '#0F172A', boxShadow: 'none' }}>
                  Finalize All
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Attendance</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Salary (Click to Edit)</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9', textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unfinalizedEmployees.map((emp) => {
                    const calc = calculateSalary(emp);
                    const setting = getEmpSetting(emp.id);
                    return (
                      <TableRow key={emp.id} hover>
                        <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 1.5, cursor: 'pointer' }} onClick={() => setSettingModalEmp(emp)}>
                          <Tooltip title="Click to edit compliance/overtime settings">
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB', textDecoration: 'underline', textDecorationColor: '#BFDBFE', textUnderlineOffset: '2px' }}>{emp.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>{emp.dept}</Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F1F5F9' }}>
                          <Chip label={setting.type.replace('_', ' ')} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F1F5F9' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {calc.attendanceDays}/{calc.totalDays} Days
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => setBreakdownModalEmp(emp)}>
                          <Tooltip title="Click to view/edit exact salary breakdown">
                             <Box sx={{ p: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#F1F5F9' }, display: 'inline-block' }}>
                                <Typography variant="subtitle2" sx={{ color: '#10B981', fontWeight: 900 }}>₹{calc.net.toLocaleString()}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Gross: ₹{calc.gross.toLocaleString()}</Typography>
                             </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>
                          <Button size="small" variant="contained" onClick={() => handleFinalize(emp)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: '#4F46E5', boxShadow: 'none' }}>
                            Finalize
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {unfinalizedEmployees.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8' }}>All employees finalized!</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* TAB 1: Bulk Attendance Spreadsheet */}
        {activeTab === 1 && (
          <Box sx={{ position: 'relative' }}>
            {/* Premium Save Banner */}
            {hasChanges && (
               <Box sx={{ position: 'sticky', top: 0, zIndex: 10, background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)', borderRadius: '16px', p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }}>
                  <Typography sx={{ fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
                     <SaveIcon /> Unsaved Attendance Changes
                  </Typography>
                  <Button variant="contained" onClick={handleSaveAttendance} sx={{ bgcolor: '#FFFFFF', color: '#4F46E5', fontWeight: 900, borderRadius: '8px', px: 3, '&:hover': {bgcolor: '#F8FAFC', transform: 'translateY(-1px)'}, transition: 'all 0.2s' }}>
                     Save Changes
                  </Button>
               </Box>
            )}
            
            <Paper elevation={0} sx={{ p: 0, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>Bulk Attendance</Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                     Select status from dropdowns. To paint multiple cells, click & hold the corner dot and drag in any direction!
                  </Typography>
                </Box>
              </Box>
            
              <Box sx={{ overflowX: 'auto', maxHeight: '65vh' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 1200, borderCollapse: 'separate', borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 200, position: 'sticky', left: 0, top: 0, bgcolor: '#F8FAFC', zIndex: 3, fontWeight: 800, textAlign: 'left', p: 2, borderBottom: '2px solid #E2E8F0', borderRight: '2px solid #E2E8F0', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)' }}>Employee Name</TableCell>
                      {daysArr.map(d => (
                         <TableCell key={d} sx={{ minWidth: 65, top: 0, bgcolor: '#F8FAFC', zIndex: 2, fontWeight: 800, fontSize: '0.75rem', color: '#475569', p: 1.5, textAlign: 'center', borderBottom: '2px solid #E2E8F0', borderRight: '1px solid #F1F5F9' }}>
                           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                             <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem' }}>{String(d).padStart(2, '0')}</Typography>
                             <Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{currentPeriod.mStr}</Typography>
                           </Box>
                         </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((emp, index) => (
                       <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                          <TableCell sx={{ position: 'sticky', left: 0, bgcolor: '#FFFFFF', zIndex: 1, textAlign: 'left', px: 2, borderRight: '2px solid #E2E8F0', borderBottom: '1px solid #F1F5F9', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)' }}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B' }}>{emp.name}</Typography>
                             <Typography variant="caption" sx={{ color: '#94A3B8' }}>{emp.empId}</Typography>
                          </TableCell>
                          {daysArr.map(day => {
                             const dateKey = `${currentPeriod.y}-${currentPeriod.mIdx+1}-${day}`;
                             const val = (unsavedGrid[emp.id] && unsavedGrid[emp.id][dateKey]) || 'P';
                             
                             return (
                               <TableCell 
                                  key={day} 
                                  sx={{ 
                                     bgcolor: getCellColor(val), position: 'relative', p: 0, height: '45px',
                                     borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9',
                                     '&:hover .drag-handle': { opacity: 1 }, transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={() => {
                                     if (dragState) {
                                         handleCellChange(emp.id, day, dragState.val);
                                     }
                                  }}
                               >
                                  <select 
                                     value={val}
                                     onChange={(e) => handleCellChange(emp.id, day, e.target.value)}
                                     style={{ 
                                        width: '100%', height: '100%', border: 'none', background: 'transparent', 
                                        fontWeight: 900, textAlign: 'center', cursor: 'pointer', appearance: 'none',
                                        color: getCellText(val), outline: 'none', fontSize: '0.85rem'
                                     }}
                                  >
                                     <option value="P">P</option>
                                     <option value="A">A</option>
                                     <option value="L">L</option>
                                     <option value="W">W</option>
                                  </select>
                                  
                                  {/* Drag Handle (Omni-directional brush) */}
                                  <div 
                                     className="drag-handle"
                                     onMouseDown={(e) => {
                                        setDragState({ val });
                                        e.preventDefault();
                                     }}
                                     style={{
                                        position: 'absolute', bottom: '4px', right: '4px', width: '8px', height: '8px',
                                        backgroundColor: getCellText(val), borderRadius: '50%', cursor: 'crosshair', zIndex: 5,
                                        opacity: 0, transition: 'opacity 0.2s', boxShadow: '0 0 0 2px #FFF'
                                     }}
                                  />
                               </TableCell>
                             );
                          })}
                       </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Box>
        )}

        {/* TAB 2: Finalized Payroll */}
        {activeTab === 2 && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>Finalized Payroll</Typography>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Net Payable</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', borderBottom: '2px solid #F1F5F9', textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalized.map((record) => (
                    <TableRow key={record.recordId} hover>
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>{record.name}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{record.month}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9' }}>
                        <Typography variant="subtitle2" sx={{ color: '#10B981', fontWeight: 900 }}>₹{record.net.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9' }}>
                        <Chip label={record.status} size="small" icon={record.status === 'Paid' ? <CheckCircleIcon /> : undefined} sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24, bgcolor: record.status === 'Paid' ? '#DCFCE7' : '#FEF3C7', color: record.status === 'Paid' ? '#10B981' : '#D97706', '& .MuiChip-icon': { color: 'inherit' } }} />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>
                        {record.status === 'Finalized' ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                             <Button size="small" variant="contained" onClick={() => handleMarkPaid(record.recordId)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: '#10B981', boxShadow: 'none' }}>
                               Mark Paid
                             </Button>
                             <IconButton size="small" onClick={() => handleDefinalize(record.recordId)} sx={{ color: '#EF4444' }}><UndoIcon fontSize="small" /></IconButton>
                          </Box>
                        ) : (
                          <Button size="small" variant="outlined" onClick={() => handleDownloadPayslip(record)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, borderColor: '#4F46E5', color: '#4F46E5', '&:hover': {bgcolor: '#EEF2FF'} }}>
                            Payslip
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {finalized.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8' }}>No finalized records.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {/* Employee Settings Popup */}
      <Dialog open={!!settingModalEmp} onClose={() => setSettingModalEmp(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Settings: {settingModalEmp?.name}</Typography>
          <IconButton onClick={() => setSettingModalEmp(null)}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
           {settingModalEmp && (() => {
              const setting = getEmpSetting(settingModalEmp.id);
              return (
                 <>
                   <Box>
                     <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Payroll Compliance</Typography>
                     <TextField select fullWidth size="small" value={setting.type} onChange={(e) => {
                         const updated = { ...settings, [settingModalEmp.id]: { ...setting, type: e.target.value } };
                         saveSettings(updated);
                     }}>
                       <MenuItem value="COMPLIANCE">With Compliance (EPF, TDS)</MenuItem>
                       <MenuItem value="NO_COMPLIANCE">No Compliance (Flat)</MenuItem>
                       <MenuItem value="HOURLY">Hourly Salary</MenuItem>
                     </TextField>
                   </Box>
                   <Box>
                     <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Overtime Rule</Typography>
                     <TextField select fullWidth size="small" value={setting.overtimeType} onChange={(e) => {
                         const updated = { ...settings, [settingModalEmp.id]: { ...setting, overtimeType: e.target.value } };
                         saveSettings(updated);
                     }}>
                       <MenuItem value="FIXED">Fixed Amount</MenuItem>
                       <MenuItem value="1X">1x Daily Wage</MenuItem>
                       <MenuItem value="1.5X">1.5x Daily Wage</MenuItem>
                       <MenuItem value="2X">2x Daily Wage</MenuItem>
                     </TextField>
                     {setting.overtimeType === 'FIXED' && (
                       <TextField fullWidth size="small" type="number" label="Fixed Rate per Hour" value={setting.overtimeRate} onChange={(e) => {
                           const updated = { ...settings, [settingModalEmp.id]: { ...setting, overtimeRate: e.target.value } };
                           saveSettings(updated);
                       }} sx={{ mt: 2 }} />
                     )}
                   </Box>
                 </>
              );
           })()}
        </DialogContent>
      </Dialog>

      {/* Salary Breakdown & Manual Edit Popup */}
      <Dialog open={!!breakdownModalEmp} onClose={() => setBreakdownModalEmp(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Salary Breakdown: {breakdownModalEmp?.name}</Typography>
          <IconButton onClick={() => setBreakdownModalEmp(null)}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
           {breakdownModalEmp && (() => {
              const calc = calculateSalary(breakdownModalEmp);
              const custom = customBreakdowns[breakdownModalEmp.id] || {};
              const handleCustomChange = (field, val) => {
                 const newVal = val === '' ? undefined : Number(val);
                 saveBreakdowns({ ...customBreakdowns, [breakdownModalEmp.id]: { ...custom, [field]: newVal } });
              };
              return (
                 <>
                   <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                     Calculation based on <b>{calc.attendanceDays}</b> attendance days.
                     You can override calculated deductions manually below.
                   </Typography>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                     <Typography sx={{ fontWeight: 700 }}>Gross Pay</Typography>
                     <Typography sx={{ fontWeight: 900 }}>₹{calc.gross.toLocaleString()}</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField fullWidth size="small" type="number" label="EPF Deduction (₹)" value={custom.epf !== undefined ? custom.epf : calc.epf} onChange={e => handleCustomChange('epf', e.target.value)} />
                      <TextField fullWidth size="small" type="number" label="TDS Deduction (₹)" value={custom.tds !== undefined ? custom.tds : calc.tds} onChange={e => handleCustomChange('tds', e.target.value)} />
                   </Box>
                   <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField fullWidth size="small" type="number" label="Prof. Tax (₹)" value={custom.pt !== undefined ? custom.pt : calc.pt} onChange={e => handleCustomChange('pt', e.target.value)} />
                      <TextField fullWidth size="small" type="number" label="Add Overtime (₹)" value={custom.overtimeAmount !== undefined ? custom.overtimeAmount : calc.overtimeAmount} onChange={e => handleCustomChange('overtimeAmount', e.target.value)} />
                   </Box>
                   
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#DCFCE7', borderRadius: '12px', mt: 2 }}>
                     <Typography sx={{ fontWeight: 800, color: '#15803D' }}>Net Payable</Typography>
                     <Typography sx={{ fontWeight: 900, color: '#10B981', fontSize: '1.2rem' }}>₹{calc.net.toLocaleString()}</Typography>
                   </Box>
                 </>
              );
           })()}
        </DialogContent>
      </Dialog>

      {/* Global/Bulk Settings Popup */}
      <Dialog open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Global Settings</Typography>
          <IconButton onClick={() => setBulkModalOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
           <Box>
             <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Select Employees</Typography>
             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
               <Checkbox checked={bulkSelected.length === unfinalizedEmployees.length} onChange={(e) => setBulkSelected(e.target.checked ? unfinalizedEmployees.map(e => e.id) : [])} />
               <Typography variant="body2" sx={{ fontWeight: 700 }}>Select All Pending</Typography>
             </Box>
           </Box>
           <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Payroll Type</Typography>
                <TextField select fullWidth size="small" value={bulkType} onChange={e => setBulkType(e.target.value)}>
                  <MenuItem value="">-- Leave Unchanged --</MenuItem>
                  <MenuItem value="COMPLIANCE">With Compliance</MenuItem>
                  <MenuItem value="NO_COMPLIANCE">No Compliance</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Overtime Rule</Typography>
                <TextField select fullWidth size="small" value={bulkOvertime} onChange={e => setBulkOvertime(e.target.value)}>
                  <MenuItem value="">-- Leave Unchanged --</MenuItem>
                  <MenuItem value="FIXED">Fixed Amount</MenuItem>
                  <MenuItem value="1.5X">1.5x Multiplier</MenuItem>
                </TextField>
              </Box>
           </Box>
           <Button variant="contained" onClick={applyBulkSettings} sx={{ bgcolor: '#0F172A', color: '#FFF', fontWeight: 800, mt: 2 }}>Apply to {bulkSelected.length} Employees</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminPayroll;
