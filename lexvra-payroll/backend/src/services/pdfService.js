const PDFDocument = require('pdfkit');

const generatePayslipPDF = (payrollData, employeeData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Branding
      doc.fillColor('#0B47A9').fontSize(20).text('LEXVRA INFINOLOGY PVT. LTD.', 40, 40, { bold: true });
      doc.fillColor('#64748B').fontSize(9).text('Innovate. Integrate. Elevate.', 40, 65);
      doc.text('E-229, Industrial Area, Phase 8-B, Mohali, Punjab 160055', 40, 78);

      doc.fillColor('#0B47A9').fontSize(14).text(`PAYSLIP FOR ${payrollData.month}/${payrollData.year}`, 380, 40, { align: 'right' });
      doc.fillColor('#64748B').fontSize(9).text(`Generated: ${new Date().toLocaleDateString()}`, 380, 60, { align: 'right' });

      doc.moveTo(40, 100).lineTo(550, 100).strokeColor('#E2E8F0').stroke();

      // Employee Information Grid
      doc.fontSize(10).fillColor('#1E293B');
      doc.text(`Employee ID: ${employeeData.employeeId || 'EMP001'}`, 40, 115);
      doc.text(`Employee Name: ${employeeData.firstName} ${employeeData.lastName}`, 40, 130);
      doc.text(`Department: ${employeeData.department?.name || 'Engineering'}`, 40, 145);
      doc.text(`Designation: ${employeeData.designation?.title || 'Software Engineer'}`, 40, 160);

      doc.text(`Bank Name: ${employeeData.bankName || 'HDFC Bank'}`, 320, 115);
      doc.text(`A/C Number: ${employeeData.accountNumber || 'XXXX XXXX 4920'}`, 320, 130);
      doc.text(`PAN: ${employeeData.panNumber || 'ABCDE1234F'}`, 320, 145);
      doc.text(`Days Worked: ${payrollData.daysWorked || 30}/${payrollData.totalDaysInMonth || 30}`, 320, 160);

      doc.moveTo(40, 185).lineTo(550, 185).strokeColor('#E2E8F0').stroke();

      // Earnings & Deductions Table Header
      let y = 200;
      doc.rect(40, y, 250, 24).fill('#F1F5F9');
      doc.fillColor('#0F172A').fontSize(10).text('EARNINGS', 50, y + 7, { bold: true });
      doc.text('AMOUNT (₹)', 210, y + 7, { bold: true });

      doc.rect(300, y, 250, 24).fill('#F1F5F9');
      doc.text('DEDUCTIONS', 310, y + 7, { bold: true });
      doc.text('AMOUNT (₹)', 470, y + 7, { bold: true });

      y += 30;

      // Table Rows
      const earnings = [
        ['Basic Salary', payrollData.basicSalary || 0],
        ['HRA', payrollData.allowances?.hra || 0],
        ['Special Allowance', payrollData.allowances?.specialAllowance || 0],
        ['DA', payrollData.allowances?.da || 0],
        ['Conveyance', payrollData.allowances?.conveyance || 0],
        ['Bonus / Incentives', (payrollData.allowances?.bonus || 0) + (payrollData.allowances?.incentives || 0)]
      ];

      const deductions = [
        ['Provident Fund (PF)', payrollData.statutoryDeductions?.pf || 0],
        ['Employee ESI', payrollData.statutoryDeductions?.esi || 0],
        ['Professional Tax (PT)', payrollData.statutoryDeductions?.professionalTax || 0],
        ['Income Tax (TDS)', payrollData.statutoryDeductions?.tds || 0],
        ['Loan / Advance Recovery', (payrollData.otherDeductions?.loanRecovery || 0) + (payrollData.otherDeductions?.advanceRecovery || 0)],
        ['LOP Deduction', payrollData.otherDeductions?.lopDeduction || 0]
      ];

      doc.fillColor('#334155').fontSize(9);
      for (let i = 0; i < Math.max(earnings.length, deductions.length); i++) {
        const e = earnings[i] || ['', ''];
        const d = deductions[i] || ['', ''];

        doc.text(e[0], 50, y);
        if (e[1] !== '') doc.text(`₹ ${Number(e[1]).toLocaleString()}`, 210, y);

        doc.text(d[0], 310, y);
        if (d[1] !== '') doc.text(`₹ ${Number(d[1]).toLocaleString()}`, 470, y);

        y += 18;
      }

      doc.moveTo(40, y + 5).lineTo(550, y + 5).strokeColor('#0B47A9').stroke();
      y += 15;

      // Summary Totals
      doc.fontSize(10).fillColor('#0F172A');
      doc.text(`Gross Earnings: ₹ ${Number(payrollData.grossSalary || 0).toLocaleString()}`, 50, y, { bold: true });
      doc.text(`Total Deductions: ₹ ${Number(payrollData.totalDeductions || 0).toLocaleString()}`, 310, y, { bold: true });

      y += 25;

      // Net Pay Box
      doc.rect(40, y, 510, 35).fill('#0B47A9');
      doc.fillColor('#FFFFFF').fontSize(12).text('NET PAYABLE SALARY:', 50, y + 10, { bold: true });
      doc.fontSize(14).text(`₹ ${Number(payrollData.netSalary || 0).toLocaleString()}`, 380, y + 9, { align: 'right', bold: true });

      y += 55;
      doc.fillColor('#64748B').fontSize(8).text('This is a computer-generated payslip and does not require a physical signature.', 40, y, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePayslipPDF };
