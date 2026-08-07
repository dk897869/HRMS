import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar } from '@mui/material';
import {
  Download as DownloadIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Savings as SavingsIcon,
  Home as HomeIcon,
  HomeWork as HomeWorkIcon,
  ArrowForward as ArrowForwardIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalHospital as LocalHospitalIcon,
  Star as StarIcon,
  Shield as ShieldIcon,
  ReceiptLong as ReceiptLongIcon,
  Percent as PercentIcon,
  CalendarToday as CalendarTodayIcon,
  Event as EventIcon,
  Badge as BadgeIcon,
  AccountTree as AccountTreeIcon,
  Work as WorkOutlineIcon,
  Calculate as CalculateIcon,
  Description as DescriptionIcon,
  Policy as PolicyIcon,
  MoreVert as MoreVertIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { generateSalarySlipPDF } from '../../utils/payslipGenerator';
import axiosClient from '../../api/axiosClient';

const EmployeePayroll = () => {
  const user = useSelector((state) => state.auth.user);
  const [payrolls, setPayrolls] = useState([]);

  // Dynamic Designation
  const designationTitle = user?.employeeRef?.designation?.title || 
                           user?.employeeRef?.designationName || 
                           (typeof user?.employeeRef?.designation === 'object' ? user?.employeeRef?.designation?.title : user?.employeeRef?.designation) || 
                           'Employee';

  // Dynamic Data Calculation
  const ctc = user?.employeeRef?.ctc || 500000;
  // Admin enters 'baseSalary' in the form, which represents the target Net In-Hand Salary
  const netTakeHome = user?.employeeRef?.baseSalary || 37000; 
  
  const basicPay = 18000; // Fixed as requested
  const hra = 7200; // 40% of 18000
  const conveyance = 1600;
  const medical = 1250;
  
  const epf = Math.round(basicPay * 0.12); // 2160
  const pt = 200;
  const totalDeductions = epf + pt; 
  
  const grossEarnings = netTakeHome + totalDeductions; 
  const specialAllowance = Math.max(0, grossEarnings - basicPay - hra - conveyance - medical);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await axiosClient.get('/payroll');
        setPayrolls(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch payrolls', err);
      }
    };
    fetchPayrolls();
  }, []);

  const formatDateHelper = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-GB', { month: 'short' });
    let year = d.getFullYear();
    if (year < 100) year += 2000;
    return `${day} ${month} ${year}`;
  };

  const handleDownloadPayslip = async (monthName = 'July 2026', payrollId = null) => {
    if (payrollId) {
      try {
        const res = await axiosClient.get(`/payroll/${payrollId}/payslip`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Payslip_${monthName.replace(' ', '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`Payslip for ${monthName} downloaded!`);
        return;
      } catch (err) {
        toast.error('Failed to download generated payslip');
      }
    }
    
    // Fetch settings dynamically to inject company brand and logo
    let settings = {};
    try {
      const res = await axiosClient.get('/settings');
      if (res.data?.data) settings = res.data.data;
    } catch (err) {
      console.error('Failed to fetch settings for payslip', err);
    }
    
    // Fallback to client-side generation for projected/current month
    generateSalarySlipPDF({
      name: user?.name || 'Employee',
      empId: user?.employeeRef?.employeeId || 'EMP001',
      designation: designationTitle,
      department: user?.employeeRef?.department?.name || '',
      joiningDate: formatDateHelper(user?.employeeRef?.joiningDate),
      dob: formatDateHelper(user?.employeeRef?.dob),
      bankName: user?.employeeRef?.bankName || '',
      accountNo: user?.employeeRef?.accountNumber || '',
      pan: user?.employeeRef?.panNumber || '',
      uan: user?.employeeRef?.uanNumber || '',
      esi: user?.employeeRef?.esiNumber || '',
      memberId: user?.employeeRef?.pfNumber || user?.employeeRef?.uanNumber || '', // fallback to UAN if no separate PF Member ID
      month: monthName,
      basicSalary: basicPay ?? 0,
      hra: hra ?? 0,
      conveyance: conveyance ?? 0,
      medical: medical ?? 0,
      specialAllowance: specialAllowance ?? 0,
      grossEarnings: grossEarnings ?? 0,
      epf: epf ?? 0,
      totalDeductions: totalDeductions ?? 0,
      netPay: netTakeHome ?? 0
    }, settings);
    toast.success('Payslip downloaded successfully!');
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            My Salary & Payslips
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>
            Your complete compensation overview, breakdowns, and payslip records
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={() => handleDownloadPayslip('July 2026')}
          sx={{ bgcolor: '#0F172A', color: '#FFF', fontWeight: 700, borderRadius: '12px', py: 1.5, px: 4, fontSize: '0.95rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#1E293B', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' } }}
        >
          Download Payslip
        </Button>
      </Box>

      {/* EXPANDED TOP 4 STATS */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { title: 'Annual CTC', value: `\u20B9 ${ctc.toLocaleString()}`, sub: 'Cost to Company', color: '#4F46E5', bg: '#EEF2FF' },
          { title: 'Basic Salary', value: `\u20B9 ${basicPay.toLocaleString()} / mo`, sub: 'Fixed Component', color: '#10B981', bg: '#ECFDF5' },
          { title: 'Total Deductions', value: `\u20B9 ${totalDeductions.toLocaleString()}`, sub: 'This Month', color: '#F59E0B', bg: '#FFFBEB' },
          { title: 'Net Take-Home', value: `\u20B9 ${netTakeHome.toLocaleString()} / mo`, sub: 'After Deductions', color: '#3B82F6', bg: '#EFF6FF' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Box sx={{ p: 4, borderRadius: '20px', bgcolor: '#FFFFFF', position: 'relative', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', borderTop: `4px solid ${stat.color}`, width: '100%' }} />
              <Typography sx={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: '2rem', fontWeight: 900, mb: 1 }}>{stat.value}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stat.color }} />
                <Typography sx={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600 }}>{stat.sub}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: SALARY SLIP BREAKDOWN */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', bgcolor: '#FFFFFF', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.5, letterSpacing: '-0.5px' }}>Salary Slip Breakdown</Typography>
                <Typography sx={{ color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>Detailed view of your current month's compensation</Typography>
              </Box>
              <Chip label="Dynamic Generation" size="medium" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, px: 2, borderRadius: '8px' }} />
            </Box>

            <Grid container spacing={6}>
              {/* EARNINGS */}
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: '#10B981', fontWeight: 800, fontSize: '0.9rem', mb: 3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Earnings & Allowances</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { label: 'Basic Salary', val: basicPay },
                    { label: 'House Rent Allowance (HRA)', val: hra },
                    { label: 'Conveyance Allowance', val: conveyance },
                    { label: 'Medical Allowance', val: medical },
                    { label: 'Special Allowance', val: specialAllowance },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '1rem' }}>{item.label}</Typography>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '1.05rem' }}>&#8377; {item.val.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 2, pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '1.2rem' }}>Gross Earnings</Typography>
                    <Typography sx={{ color: '#10B981', fontWeight: 900, fontSize: '1.4rem' }}>&#8377; {grossEarnings.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* DEDUCTIONS */}
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: '#EF4444', fontWeight: 800, fontSize: '0.9rem', mb: 3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Deductions & Statutory</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { label: 'Provident Fund (EPF 12%)', val: epf },
                    { label: 'Professional Tax (PT)', val: pt },
                    { label: 'TDS / Income Tax', val: 0.00 },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '1rem' }}>{item.label}</Typography>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '1.05rem' }}>&#8377; {item.val.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 'auto', pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '1.2rem' }}>Total Deductions</Typography>
                    <Typography sx={{ color: '#EF4444', fontWeight: 900, fontSize: '1.4rem' }}>&#8377; {totalDeductions.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* EXPANSIVE NET PAY BANNER */}
            <Box sx={{ mt: 7, p: { xs: 4, md: 5 }, bgcolor: '#0F172A', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, transform: 'rotate(-15deg)' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: '12rem', color: '#FFF' }} />
              </Box>
              <Box sx={{ zIndex: 1 }}>
                <Typography sx={{ color: '#94A3B8', fontWeight: 700, fontSize: '1.1rem', mb: 1, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Net Pay (Disbursed)</Typography>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '3rem', lineHeight: 1 }}>&#8377; {netTakeHome.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
              </Box>
              <Box sx={{ zIndex: 1, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>Transferred to Salary Account</Typography>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>Automated via Lexvra Payroll</Typography>
              </Box>
            </Box>
          </Box>

          {/* PAYSLIP HISTORY */}
          <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', bgcolor: '#FFFFFF' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, letterSpacing: '-0.5px' }}>Payslip History</Typography>
              <Typography sx={{ color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>Access all your historical payslips and tax documents</Typography>
            </Box>
            
            <TableContainer sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', py: 2.5, borderBottom: '2px solid #F1F5F9', px: 2 }}>Month</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', py: 2.5, borderBottom: '2px solid #F1F5F9' }}>Pay Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', py: 2.5, borderBottom: '2px solid #F1F5F9' }}>Gross Pay</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', py: 2.5, borderBottom: '2px solid #F1F5F9' }}>Deductions</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', py: 2.5, borderBottom: '2px solid #F1F5F9' }}>Net Pay</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', py: 2.5, borderBottom: '2px solid #F1F5F9', px: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { month: 'July 2026', date: '01 Aug 2026', gross: 39360.00, ded: 2360.00, net: 37000.00 },
                    { month: 'June 2026', date: '01 Jul 2026', gross: 39360.00, ded: 2360.00, net: 37000.00 },
                    { month: 'May 2026', date: '01 Jun 2026', gross: 39360.00, ded: 2360.00, net: 37000.00 },
                  ].map((row, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 3, borderBottom: '1px solid #F1F5F9', px: 2, fontSize: '1rem' }}>{row.month}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontWeight: 600, py: 3, borderBottom: '1px solid #F1F5F9', fontSize: '1rem' }}>{row.date}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A', py: 3, borderBottom: '1px solid #F1F5F9', fontSize: '1rem' }}>&#8377; {row.gross.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#EF4444', py: 3, borderBottom: '1px solid #F1F5F9', fontSize: '1rem' }}>&#8377; {row.ded.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 3, borderBottom: '1px solid #F1F5F9', fontSize: '1rem' }}>&#8377; {row.net.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell align="right" sx={{ py: 3, borderBottom: '1px solid #F1F5F9', px: 2 }}>
                        <Button 
                          onClick={() => handleDownloadPayslip(row.month)}
                          startIcon={<DownloadIcon sx={{ fontSize: '1.2rem' }}/>} 
                          sx={{ color: '#4F46E5', bgcolor: '#EEF2FF', fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', py: 1, px: 2.5, borderRadius: '8px', '&:hover': { bgcolor: '#E0E7FF' } }}
                        >
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} lg={4}>
          {/* Payslip Summary */}
          <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', bgcolor: '#FFFFFF', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mb: 4, letterSpacing: '-0.5px', fontSize: '1.3rem' }}>Profile Summary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Pay Period', val: 'July 2026' },
                { label: 'Pay Date', val: '01 Aug 2026' },
                { label: 'Employee ID', val: user?.employeeRef?.employeeId || 'EMP001' },
                { label: 'Department', val: user?.employeeRef?.department?.name || 'Engineering' },
                { label: 'Designation', val: designationTitle || 'Full Stack Developer' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, borderBottom: i !== 4 ? '1px solid #F1F5F9' : 'none' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '1rem' }}>{item.label}</Typography>
                  <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '1rem', textAlign: 'right' }}>{item.val}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Quick Actions - List Style */}
          <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', bgcolor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mb: 4, letterSpacing: '-0.5px', fontSize: '1.3rem' }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { title: 'Salary Overview', sub: 'View yearly breakdown', color: '#4F46E5', bg: '#EEF2FF', icon: <CalculateIcon /> },
                { title: 'Tax Details', sub: 'View TDS & tax info', color: '#10B981', bg: '#ECFDF5', icon: <AccountBalanceWalletIcon /> },
                { title: 'Form 16', sub: 'Download Form 16', color: '#F59E0B', bg: '#FFFBEB', icon: <DescriptionIcon /> },
                { title: 'Investment Proofs', sub: 'Submit & manage', color: '#8B5CF6', bg: '#F5F3FF', icon: <PolicyIcon /> }
              ].map((action, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: action.bg, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {action.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', mb: 0.5 }}>{action.title}</Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 500 }}>{action.sub}</Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ color: '#CBD5E1', fontSize: '1.2rem' }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeePayroll;
