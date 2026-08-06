import jsPDF from 'jspdf';

// Helper to get number of days in a month dynamically
const getDaysInMonth = (monthStr) => {
  const monthLower = monthStr.toLowerCase();
  if (monthLower.includes('jan')) return 31;
  if (monthLower.includes('feb')) return 28;
  if (monthLower.includes('mar')) return 31;
  if (monthLower.includes('apr')) return 30;
  if (monthLower.includes('may')) return 31;
  if (monthLower.includes('jun')) return 30;
  if (monthLower.includes('jul')) return 31;
  if (monthLower.includes('aug')) return 31;
  if (monthLower.includes('sep')) return 30;
  if (monthLower.includes('oct')) return 31;
  if (monthLower.includes('nov')) return 30;
  if (monthLower.includes('dec')) return 31;
  return 30;
};

const numberToWords = (num) => {
  const val = Number(num) || 0;
  const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (val.toString().length > 9) return 'overflow';
  let n = ('000000000' + val).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
  return 'Rupees ' + str.trim();
};

export const generateSalarySlipPDF = (employeeData) => {
  const PDFClass = jsPDF.jsPDF || jsPDF;
  const doc = new PDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const formatNum = (num) => (Number(num) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // Data extraction
  const monthName = employeeData?.month || 'July 2026';
  const totalDays = getDaysInMonth(monthName);
  
  const basic = employeeData?.basicSalary ?? 18000;
  const hra = employeeData?.hra ?? 7200;
  const conveyance = employeeData?.conveyance ?? 1600;
  const medical = employeeData?.medical ?? 1250;
  const specialAllowance = employeeData?.specialAllowance ?? 0;
  const gross = basic + hra + conveyance + medical + specialAllowance;

  const epf = employeeData?.epf ?? 0;
  const pt = employeeData?.pt ?? 200;
  const totalDeductions = epf + pt;
  const netPay = gross - totalDeductions;
  
  const emp = {
    name: employeeData?.name || '',
    empId: employeeData?.empId || '',
    designation: employeeData?.designation || '',
    department: employeeData?.department || '',
    joiningDate: employeeData?.joiningDate || '',
    dob: employeeData?.dob || '',
    bankName: employeeData?.bankName || '',
    accountNo: employeeData?.accountNo || '',
    pan: employeeData?.pan || '',
    uan: employeeData?.uan || '',
    memberId: employeeData?.memberId || '',
    esi: employeeData?.esi || '',
    month: monthName,
    nod: totalDays,
    ndp: totalDays,
    employerEpf: epf,
    ctcMonthly: gross + epf
  };

  // Outer Page Frame
  doc.setDrawColor(241, 245, 249); // F1F5F9 - very light gray frame
  doc.setLineWidth(2);
  doc.rect(4, 4, 202, 289);

  // --- 1. Header Section ---
  // Logo LX
  doc.setDrawColor(11, 25, 48); // #0B1930
  doc.setLineWidth(2.5);
  doc.line(12, 14, 12, 28); // L vert
  doc.line(12, 28, 22, 28); // L horiz
  doc.line(18, 16, 28, 28); // X diag 1
  doc.line(28, 16, 18, 28); // X diag 2

  doc.setTextColor(11, 25, 48);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LEXVRA INFINOLOGY PRIVATE LIMITED', 105, 16, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('E-229, Industrial Area, Phase 8-B, Mohali, Punjab - 160071', 105, 21, { align: 'center' });
  doc.text('CIN: U72900PB2023PTC123456', 105, 26, { align: 'center' });

  // Divider under header
  doc.setDrawColor(226, 232, 240); // E2E8F0
  doc.setLineWidth(0.4);
  doc.line(55, 30, 155, 30);

  // Title Bar (Dark Blue)
  doc.setFillColor(11, 25, 48);
  doc.roundedRect(45, 34, 120, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Payslip for the month of ${emp.month}`, 105, 40, { align: 'center' });

  // --- 2. Details Boxes ---
  let y = 47;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  
  // Left Box - Employee Details
  doc.roundedRect(10, y, 92, 42, 2, 2, 'FD');
  // Right Box - Personal Details
  doc.roundedRect(108, y, 92, 42, 2, 2, 'FD');

  // Box Headers Background
  doc.setFillColor(248, 250, 252);
  
  // Icons & Titles (simulate with text/shapes for exact look)
  doc.setFillColor(11, 25, 48);
  doc.circle(18, y + 6, 3, 'F');
  doc.circle(116, y + 6, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6);
  doc.text('ID', 18, y + 7, { align: 'center' }); // ID Icon text
  doc.text('U', 116, y + 7, { align: 'center' }); // User Icon text

  doc.setTextColor(11, 25, 48);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', 24, y + 7.5);
  doc.text('PERSONAL DETAILS', 122, y + 7.5);

  doc.setDrawColor(226, 232, 240);
  doc.line(10, y + 12, 102, y + 12);
  doc.line(108, y + 12, 200, y + 12);

  // Lists inside boxes
  doc.setFontSize(8);
  const leftItems = [
    { label: 'Emp Code', val: emp.empId },
    { label: 'DOJ', val: emp.joiningDate },
    { label: 'Department', val: emp.department },
    { label: 'NOD', val: String(emp.nod) },
    { label: 'UAN', val: emp.uan }
  ].filter(i => i.val && i.val !== 'N/A');

  const rightItems = [
    { label: 'Name', val: emp.name },
    { label: 'DOB', val: emp.dob },
    { label: 'Designation', val: emp.designation },
    { label: 'NDP', val: String(emp.ndp) },
    { label: 'A/C No.', val: emp.accountNo },
  ].filter(i => i.val && i.val !== 'N/A');

  leftItems.forEach((item, index) => {
    let rowY = y + 17 + (index * 4.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.label, 13, rowY);
    doc.text(':', 45, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.val, 50, rowY);
  });

  rightItems.forEach((item, index) => {
    let rowY = y + 17 + (index * 4.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.label, 111, rowY);
    doc.text(':', 143, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.val, 148, rowY);
  });

  // --- 3. Earnings & Deductions Tables ---
  y = 94;
  
  // Left Table - Earnings
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, y, 92, 48, 2, 2, 'FD');
  
  // Header 1
  doc.setFillColor(11, 25, 48); // Dark Blue
  doc.roundedRect(10, y, 92, 6, 2, 2, 'F');
  // Hide bottom rounding of header
  doc.rect(10, y + 4, 92, 2, 'F'); 

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('EARNINGS', 13, y + 4);

  // Header 2 (Light Gray)
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y + 6, 92, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text('Particulars', 13, y + 10);
  doc.text('Monthly Value (INR)', 58, y + 10, { align: 'center' });
  doc.text('Amount (INR)', 86, y + 10, { align: 'center' });

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const earningsList = [
    { label: 'BASIC', val: basic },
    { label: 'HRA', val: hra },
    { label: 'CONVEYANCE', val: conveyance },
    { label: 'MEDICAL ALLOWANCE', val: medical },
    { label: 'SPECIAL ALLOWANCE', val: specialAllowance }
  ];
  
  earningsList.forEach((e, idx) => {
    let rowY = y + 18 + (idx * 5);
    doc.text(e.label, 13, rowY);
    doc.text(formatNum(e.val), 68, rowY, { align: 'right' });
    doc.text(formatNum(e.val), 98, rowY, { align: 'right' });
  });

  // Totals Row Earnings
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y + 42, 92, 6, 'F'); // Bottom rounding is handled by outer rect stroke later? We can just fill.
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL EARNINGS (INR)', 13, y + 46);
  doc.text(formatNum(gross), 68, y + 46, { align: 'right' });
  doc.text(formatNum(gross), 98, y + 46, { align: 'right' });

  // Right Table - Deductions
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(108, y, 92, 48, 2, 2, 'FD');
  doc.setFillColor(11, 25, 48);
  doc.roundedRect(108, y, 92, 6, 2, 2, 'F');
  doc.rect(108, y + 4, 92, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.text('DEDUCTIONS', 111, y + 4);

  doc.setFillColor(241, 245, 249);
  doc.rect(108, y + 6, 92, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.text('Particulars', 111, y + 10);
  doc.text('Amount (INR)', 184, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const deductionsList = [
    { label: 'PF (Employee 12%)', val: epf },
    { label: 'ESI', val: 0 },
    { label: 'PROF TAX', val: pt },
    { label: 'TDS / INCOME TAX', val: 0 }
  ];

  deductionsList.forEach((d, idx) => {
    let rowY = y + 18 + (idx * 5.8);
    doc.text(d.label, 111, rowY);
    doc.text(formatNum(d.val), 196, rowY, { align: 'right' });
  });

  // Totals Row Deductions
  doc.setFillColor(241, 245, 249);
  doc.rect(108, y + 42, 92, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL DEDUCTIONS (INR)', 111, y + 46);
  doc.text(formatNum(totalDeductions), 196, y + 46, { align: 'right' });

  // Redraw outer borders for clean corners
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, y, 92, 48, 2, 2, 'S');
  doc.roundedRect(108, y, 92, 48, 2, 2, 'S');

  // --- 4. Net Salary Bar ---
  y = 146;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, y, 190, 14, 2, 2, 'FD');
  
  // Dark Blue Left Block
  doc.setFillColor(11, 25, 48);
  doc.roundedRect(10, y, 62, 14, 2, 2, 'F');
  doc.rect(68, y, 4, 14, 'F'); // Square off right side of blue box? Actually, use standard rect
  doc.rect(10, y, 62, 14, 'F'); 

  // Wallet Icon
  doc.setFillColor(255, 255, 255);
  doc.circle(18, y + 7, 4, 'F');
  doc.setTextColor(11, 25, 48);
  doc.setFontSize(6);
  doc.text('W', 18, y + 8.2, { align: 'center' }); // W for Wallet placeholder

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('NET SALARY', 26, y + 5.5);
  
  doc.setFontSize(12);
  doc.text(`Rs. ${formatNum(netPay)}`, 26, y + 10.5);

  // Net Pay in Words
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Pay in Words', 76, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(numberToWords(netPay), 76, y + 10.5);

  // Redraw outer stroke for Net Salary bar
  doc.roundedRect(10, y, 190, 14, 2, 2, 'S');

  // --- 5. Statutory, Leave, Loan Boxes ---
  y = 164;
  
  // Box 1: Statutory
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, y, 58, 36, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text('STATUTORY SUMMARY', 13, y + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('EMP PF (Employer 12%)', 13, y + 12);
  doc.text(formatNum(emp.employerEpf), 64, y + 12, { align: 'right' });
  doc.text('EMP ESIC', 13, y + 18);
  doc.text(formatNum(0), 64, y + 18, { align: 'right' });
  doc.text('STATUTORY BONUS', 13, y + 24);
  doc.text(formatNum(0), 64, y + 24, { align: 'right' });

  doc.setFillColor(241, 245, 249);
  doc.rect(10, y + 28, 58, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CTC (Gross + EPF)', 13, y + 33);
  doc.text(formatNum(emp.ctcMonthly), 64, y + 33, { align: 'right' });
  doc.roundedRect(10, y, 58, 36, 2, 2, 'S');

  // Box 2: Leave Summary
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(72, y, 78, 36, 2, 2, 'FD');
  doc.text('LEAVE SUMMARY', 75, y + 5);
  
  doc.setFillColor(241, 245, 249);
  doc.rect(72, y + 7, 78, 5, 'F');
  doc.setFontSize(7);
  doc.text('Leave', 74, y + 10.5);
  doc.text('OP', 86, y + 10.5);
  doc.text('Credit', 96, y + 10.5);
  doc.text('Avail', 108, y + 10.5);
  doc.text('Encash', 121, y + 10.5);
  doc.text('Adj', 133, y + 10.5);
  doc.text('Balance', 145, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const leaves = [
    { n: 'WL', op: '0', cr: '0', av: '0', en: '-', ad: '-', b: '0' },
    { n: 'CL', op: '0', cr: '0', av: '0', en: '-', ad: '-', b: '0' },
    { n: 'PL', op: '0', cr: '0', av: '0', en: '0', ad: '-', b: '0' },
    { n: 'SL', op: '0', cr: '0', av: '0', en: '-', ad: '-', b: '0' },
    { n: 'PBL', op: '5', cr: '0', av: '0', en: '-', ad: '-', b: '5' }
  ];
  leaves.forEach((l, idx) => {
    let rowY = y + 15.5 + (idx * 4);
    doc.text(l.n, 74, rowY);
    doc.text(l.op, 88, rowY, { align: 'center' });
    doc.text(l.cr, 99, rowY, { align: 'center' });
    doc.text(l.av, 110, rowY, { align: 'center' });
    doc.text(l.en, 124, rowY, { align: 'center' });
    doc.text(l.ad, 135, rowY, { align: 'center' });
    doc.text(l.b, 148, rowY, { align: 'center' });
  });
  doc.roundedRect(72, y, 78, 36, 2, 2, 'S');

  // Box 3: Loan Details
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(154, y, 46, 36, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LOAN DETAILS', 156, y + 5);
  
  doc.setFillColor(241, 245, 249);
  doc.rect(154, y + 7, 46, 5, 'F');
  doc.setFontSize(6.5);
  doc.text('Loan', 156, y + 10.5);
  doc.text('Taken', 165, y + 10.5);
  doc.text('Op. Bal', 175, y + 10.5);
  doc.text('EMI/Recd.', 186, y + 10.5);
  doc.text('CL Bal', 198, y + 10.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('No Loan Record', 177, y + 25, { align: 'center' });
  doc.roundedRect(154, y, 46, 36, 2, 2, 'S');


  // --- 6. Footer Section ---
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a system generated payslip and does not require a signature.', 105, 275, { align: 'center' });
  doc.line(10, 278, 200, 278);

  // Footer Contacts
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('+91 98765 43210', 25, 284);
  doc.text('info@lexvra.com', 75, 284);
  doc.text('www.lexvra.com', 125, 284);
  doc.text('Mohali, Punjab - 160071', 175, 284);

  // Icons for footer
  doc.setFillColor(15, 23, 42);
  // Phone
  doc.circle(21, 283, 1, 'F');
  // Email
  doc.circle(71, 283, 1, 'F');
  // Web
  doc.circle(121, 283, 1, 'F');
  // Pin
  doc.circle(171, 283, 1, 'F');

  doc.save(`Payslip_${emp.name.replace(/\s+/g, '_')}_${emp.month.replace(/\s+/g, '_')}.pdf`);
};
