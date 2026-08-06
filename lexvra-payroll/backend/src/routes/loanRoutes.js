const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Employee = require('../models/Employee');

// GET /api/loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json({ success: true, count: loans.length, data: loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/loans
router.post('/', async (req, res) => {
  try {
    const count = await Loan.countDocuments();
    const loanId = `LN-2026-${String(count + 1).padStart(2, '0')}`;
    
    const newLoan = new Loan({
      loanId,
      ...req.body,
      outstanding: req.body.amount,
    });

    await newLoan.save();
    res.status(201).json({ success: true, message: 'Loan / Advance Request Created', data: newLoan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/loans/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Loan Record Updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/loans/:id
router.delete('/:id', async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Loan Record Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
