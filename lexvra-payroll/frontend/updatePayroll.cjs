const fs = require('fs');

const filepath = 'src/pages/Payroll/EmployeePayroll.jsx';
let content = fs.readFileSync(filepath, 'utf8');

const returnIdx = content.indexOf('\n  return (');
if (returnIdx === -1) {
  console.log("Could not find return");
  process.exit(1);
}

const preReturn = content.substring(0, returnIdx);

const newReturn = `
  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', p: { xs: 1, md: 4 }, bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1px', color: '#111827', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            My Salary & Payslips
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '1.1rem', fontWeight: 500 }}>
            Your compensation overview, breakdown, and payslip history
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={() => handleDownloadPayslip('July 2026')}
          sx={{ bgcolor: '#111827', color: '#FFF', fontWeight: 700, borderRadius: '8px', py: 1.5, px: 3, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#374151' } }}
        >
          Download Payslip
        </Button>
      </Box>

      {/* TOP 4 STATS (Cardless) */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {[
          { title: 'Annual CTC', value: \`₹ \${ctc.toLocaleString()}\`, sub: 'Cost to Company', color: '#6366F1' },
          { title: 'Basic Salary', value: \`₹ \${basicPay.toLocaleString()} / mo\`, sub: 'Fixed Component', color: '#10B981' },
          { title: 'Total Deductions', value: \`₹ \${totalDeductions.toLocaleString()}\`, sub: 'This Month', color: '#F59E0B' },
          { title: 'Net Take-Home', value: \`₹ \${netTakeHome.toLocaleString()} / mo\`, sub: 'After Deductions', color: '#3B82F6' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Box sx={{ p: 2, borderLeft: \`4px solid \${stat.color}\`, bgcolor: 'transparent' }}>
              <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</Typography>
              <Typography sx={{ color: '#111827', fontSize: '1.75rem', fontWeight: 900, mb: 0.5 }}>{stat.value}</Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 500 }}>{stat.sub}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={6}>
        {/* LEFT COLUMN: SALARY SLIP BREAKDOWN */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid #E5E7EB' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.5px' }}>Salary Slip Breakdown</Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 500 }}>Current month's compensation package</Typography>
              </Box>
              <Chip label="Dynamic" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 800, height: 28, px: 1, borderRadius: '6px' }} />
            </Box>

            <Grid container spacing={6}>
              {/* EARNINGS */}
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '0.95rem', mb: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Earnings & Allowances</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { label: 'Basic Salary', val: basicPay },
                    { label: 'House Rent Allowance (HRA)', val: hra },
                    { label: 'Conveyance Allowance', val: conveyance },
                    { label: 'Medical Allowance', val: medical },
                    { label: 'Special Allowance', val: specialAllowance },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#4B5563', fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</Typography>
                      <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '1rem' }}>₹ {item.val.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 3, pt: 3, borderTop: '2px dashed #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>Gross Earnings</Typography>
                    <Typography sx={{ color: '#10B981', fontWeight: 900, fontSize: '1.25rem' }}>₹ {grossEarnings.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* DEDUCTIONS */}
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '0.95rem', mb: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Deductions & Statutory</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { label: 'Provident Fund (EPF 12%)', val: epf },
                    { label: 'Professional Tax (PT)', val: pt },
                    { label: 'TDS / Income Tax', val: 0.00 },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#4B5563', fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</Typography>
                      <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '1rem' }}>₹ {item.val.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 'auto', pt: 3, borderTop: '2px dashed #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>Total Deductions</Typography>
                    <Typography sx={{ color: '#EF4444', fontWeight: 900, fontSize: '1.25rem' }}>₹ {totalDeductions.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* NET PAY BANNER (Flat/Minimal) */}
            <Box sx={{ mt: 6, p: 4, bgcolor: '#111827', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ color: '#9CA3AF', fontWeight: 700, fontSize: '0.9rem', mb: 1, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Net Pay (Disbursed)</Typography>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>₹ {netTakeHome.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
              </Box>
              <LockIcon sx={{ fontSize: '3rem', color: '#374151', opacity: 0.8 }} />
            </Box>
          </Box>

          {/* PAYSLIP HISTORY */}
          <Box sx={{ mt: 8 }}>
            <Box sx={{ mb: 4, pb: 2, borderBottom: '1px solid #E5E7EB' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.5px' }}>Payslip History</Typography>
            </Box>
            
            <TableContainer sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '2px solid #E5E7EB', px: 0 }}>Month</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '2px solid #E5E7EB' }}>Pay Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '2px solid #E5E7EB' }}>Gross Pay</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '2px solid #E5E7EB' }}>Deductions</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '2px solid #E5E7EB' }}>Net Pay</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '2px solid #E5E7EB', px: 0 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { month: 'July 2026', date: '01 Aug 2026', gross: 39360.00, ded: 2360.00, net: 37000.00 },
                    { month: 'June 2026', date: '01 Jul 2026', gross: 39360.00, ded: 2360.00, net: 37000.00 },
                    { month: 'May 2026', date: '01 Jun 2026', gross: 39360.00, ded: 2360.00, net: 37000.00 },
                  ].map((row, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#F3F4F6' } }}>
                      <TableCell sx={{ fontWeight: 800, color: '#111827', py: 2.5, borderBottom: '1px solid #E5E7EB', px: 0 }}>{row.month}</TableCell>
                      <TableCell sx={{ color: '#6B7280', fontWeight: 500, py: 2.5, borderBottom: '1px solid #E5E7EB' }}>{row.date}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', py: 2.5, borderBottom: '1px solid #E5E7EB' }}>₹ {row.gross.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#EF4444', py: 2.5, borderBottom: '1px solid #E5E7EB' }}>₹ {row.ded.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#111827', py: 2.5, borderBottom: '1px solid #E5E7EB' }}>₹ {row.net.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #E5E7EB', px: 0 }}>
                        <Button 
                          onClick={() => handleDownloadPayslip(row.month)}
                          startIcon={<DownloadIcon sx={{ fontSize: '1.2rem' }}/>} 
                          sx={{ color: '#111827', fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', py: 1, px: 2, borderRadius: '6px', '&:hover': { bgcolor: '#E5E7EB' } }}
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
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 4, pb: 2, borderBottom: '1px solid #E5E7EB', letterSpacing: '-0.5px' }}>Summary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { label: 'Pay Period', val: 'July 2026' },
                { label: 'Pay Date', val: '01 Aug 2026' },
                { label: 'Employee ID', val: user?.employeeRef?.employeeId || 'EMP001' },
                { label: 'Department', val: user?.employeeRef?.department?.name || 'Engineering' },
                { label: 'Designation', val: designationTitle || 'Full Stack Developer' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</Typography>
                  <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '0.9rem', textAlign: 'right' }}>{item.val}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 4, pb: 2, borderBottom: '1px solid #E5E7EB', letterSpacing: '-0.5px' }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { title: 'Salary Overview', sub: 'View yearly breakdown' },
                { title: 'Tax Details', sub: 'View TDS & tax info' },
                { title: 'Form 16', sub: 'Download Form 16' },
                { title: 'Investment Proofs', sub: 'Submit & manage' }
              ].map((action, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: '8px', bgcolor: '#F3F4F6', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#E5E7EB' } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: '0.9rem' }}>{action.title}</Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 500 }}>{action.sub}</Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ color: '#9CA3AF', fontSize: '1rem' }} />
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
`;

fs.writeFileSync(filepath, preReturn + newReturn, 'utf8');
console.log("Success");
