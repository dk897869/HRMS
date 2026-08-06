const express = require('express');
const router = express.Router();
const { getJobs, createJob, getCandidates, updateCandidateStage } = require('../controllers/recruitmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.get('/candidates', getCandidates);
router.put('/candidates/:id/stage', updateCandidateStage);

module.exports = router;
