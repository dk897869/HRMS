const express = require('express');
const router = express.Router();
const { getAssets, createAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAssets);
router.post('/', createAsset);

module.exports = router;
