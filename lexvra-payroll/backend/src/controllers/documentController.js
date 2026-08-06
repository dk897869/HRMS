const Document = require('../models/Document');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Get All Documents (Filtered by role/employee)
// @route   GET /api/documents
const getDocuments = asyncWrapper(async (req, res) => {
  const query = {};
  
  // If the user is an employee, only show public documents OR documents specifically assigned to them
  if (req.user.role?.toUpperCase() === 'EMPLOYEE') {
    const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
    query.$or = [
      { isPublic: true },
      { employee: employeeId }
    ];
  }

  const documents = await Document.find(query).sort({ createdAt: -1 });
  return ApiResponse.success(res, 'Documents fetched successfully', documents);
});

module.exports = {
  getDocuments
};
