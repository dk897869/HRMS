const express = require('express');
const router = express.Router();
const { getPerformanceReviews, createPerformanceReview, updatePerformanceReview, deletePerformanceReview } = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPerformanceReviews);
router.post('/', createPerformanceReview);
router.put('/:id', updatePerformanceReview);
router.delete('/:id', deletePerformanceReview);

module.exports = router;
