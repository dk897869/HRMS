const express = require('express');
const router = express.Router();
const { getClaims, createClaim, updateClaimStatus } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getClaims);
router.post('/', createClaim);
router.put('/:id/status', updateClaimStatus);

module.exports = router;
