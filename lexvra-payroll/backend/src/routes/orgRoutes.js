const express = require('express');
const router = express.Router();
const { 
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
  getBranches, createBranch 
} = require('../controllers/orgController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/designations', getDesignations);
router.post('/designations', createDesignation);
router.put('/designations/:id', updateDesignation);
router.delete('/designations/:id', deleteDesignation);

router.get('/branches', getBranches);
router.post('/branches', createBranch);

module.exports = router;
