const express = require('express');
const { getDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getDocuments);

module.exports = router;
