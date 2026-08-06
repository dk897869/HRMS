const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const PerformanceReview = require('../models/PerformanceReview');
const Employee = require('../models/Employee');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const getPerformanceReviews = asyncWrapper(async (req, res) => {
  const reviews = await PerformanceReview.find()
    .populate('employee', 'firstName lastName employeeId')
    .populate('reviewer', 'firstName lastName');
  return ApiResponse.success(res, 'Performance reviews fetched', reviews);
});

const createPerformanceReview = asyncWrapper(async (req, res) => {
  const review = await PerformanceReview.create(req.body);
  
  if (req.body.isPerformerOfTheMonth) {
    // Generate PDF Certificate
    const emp = await Employee.findById(review.employee);
    if (emp) {
      const fileName = `Certificate_${emp._id}_${Date.now()}.pdf`;
      const docsDir = path.join(__dirname, '..', 'uploads', 'documents');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      const filePath = path.join(docsDir, fileName);
      
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
      });
      
      doc.pipe(fs.createWriteStream(filePath));
      
      // Load Background Template
      const templatePath = path.join(__dirname, '..', 'assets', 'certificate_template.png');
      if (fs.existsSync(templatePath)) {
        doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
        
        // Cover old "Deepak Kumar" text
        doc.rect(100, 235, doc.page.width - 200, 75).fill('#FFFFFF');
        
        // Cover old "Performer of the month..." text
        doc.rect(100, 355, doc.page.width - 200, 30).fill('#FFFFFF');
        
        // Cover old Date
        doc.rect(320, 495, 200, 25).fill('#FFFFFF');
      } else {
        // Fallback white bg
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF');
      }

      const blue = '#0F172A';
      
      // Dynamic Name
      doc.font('Times-BoldItalic').fontSize(55).fillColor(blue)
         .text(`${emp.firstName} ${emp.lastName}`, 0, 240, { align: 'center', width: doc.page.width });
         
      // Dynamic Description
      doc.font('Helvetica-Bold').fontSize(14).fillColor(blue)
         .text(`Performer of the Month for ${review.reviewPeriod}`, 0, 360, { align: 'center', width: doc.page.width });

      // Dynamic Date
      const dateString = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.font('Helvetica').fontSize(12).fillColor('#333333')
         .text(`Date: ${dateString}`, 0, 500, { align: 'center', width: doc.page.width });

      doc.end();
      
      const fileUrl = `/uploads/documents/${fileName}`;
      
      // Save Document
      await Document.create({
        title: `Performer of the Month - ${review.reviewPeriod}`,
        category: 'Certificate',
        fileUrl,
        employee: emp._id,
        isPublic: false
      });
      
      // Send Notification
      const notification = await Notification.create({
        title: '🏆 Performer of the Month!',
        message: `Congratulations ${emp.firstName}! You have been awarded Performer of the Month. Your certificate is available in your Documents.`,
        type: 'CERTIFICATE',
        recipient: emp._id,
      });

      // Emit Socket Event
      try {
        const { getIO } = require('../sockets/socketHandler');
        const io = getIO();
        if (io) {
          io.to(`user_${emp._id}`).emit('new_notification', notification);
        }
      } catch (err) {
        console.error('Socket emission failed:', err.message);
      }
    }
  }

  return ApiResponse.success(res, 'Performance review created', review, 201);
});

const updatePerformanceReview = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const review = await PerformanceReview.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!review) {
    return ApiResponse.error(res, 'Performance review not found', 404);
  }
  return ApiResponse.success(res, 'Performance review updated', review);
});

const deletePerformanceReview = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const review = await PerformanceReview.findByIdAndDelete(id);
  if (!review) {
    return ApiResponse.error(res, 'Performance review not found', 404);
  }
  return ApiResponse.success(res, 'Performance review deleted', null);
});

module.exports = { getPerformanceReviews, createPerformanceReview, updatePerformanceReview, deletePerformanceReview };
