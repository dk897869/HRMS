import jsPDF from 'jspdf';

export const generateInvoicePDF = (settings, planDetails, paymentDetails) => {
  const PDFClass = jsPDF.jsPDF || jsPDF;
  const doc = new PDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);

  // Header Background
  doc.setFillColor(67, 24, 255); // #4318FF
  doc.rect(10, 10, 190, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBSCRIPTION INVOICE', 15, 30);

  // Company Name
  doc.setFontSize(14);
  doc.text(settings?.companyName || 'PayFlexPayroll', 190, 24, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`GST: ${settings?.gstNumber || 'N/A'}`, 190, 32, { align: 'right' });

  // Invoice Meta
  doc.setTextColor(27, 37, 75); // #1B254B
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Number:', 15, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentDetails.invoiceNumber || `INV-${Date.now()}`, 50, 55);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', 15, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), 50, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 15, 69);
  doc.setTextColor(16, 185, 129); // Green
  doc.text('PAID', 50, 69);

  // Billed To
  doc.setTextColor(27, 37, 75);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 130, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings?.companyName || 'Client Name', 130, 62);
  doc.text(settings?.companyEmail || 'client@email.com', 130, 68);
  doc.text(settings?.address?.substring(0, 35) || 'Company Address', 130, 74);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 85, 195, 85);

  // Table Header
  doc.setFillColor(244, 247, 254); // #F4F7FE
  doc.rect(15, 95, 180, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 20, 101);
  doc.text('VALIDITY', 100, 101);
  doc.text('AMOUNT', 170, 101);

  // Table Row
  doc.setFont('helvetica', 'normal');
  doc.text(`Subscription: ${planDetails.name}`, 20, 115);
  doc.text(`${new Date(planDetails.start).toLocaleDateString()} - ${new Date(planDetails.expiry).toLocaleDateString()}`, 100, 115);
  doc.text(`Rs. ${planDetails.amount.toLocaleString('en-IN')}`, 170, 115);

  // Totals Divider
  doc.line(130, 130, 195, 130);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 130, 140);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs. ${planDetails.amount.toLocaleString('en-IN')}`, 170, 140);

  doc.setFont('helvetica', 'bold');
  doc.text('Tax (18% IGST):', 130, 148);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs. 0.00`, 170, 148); // Assuming inclusive

  doc.setFillColor(236, 253, 245);
  doc.rect(125, 153, 70, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Paid:', 130, 161);
  doc.text(`Rs. ${planDetails.amount.toLocaleString('en-IN')}`, 170, 161);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(163, 174, 208);
  doc.text('Thank you for choosing PayFlexPayroll!', 105, 275, { align: 'center' });

  // Save
  doc.save(`Invoice_${settings?.companyName?.replace(/\s+/g, '_') || 'Subscription'}.pdf`);
};
