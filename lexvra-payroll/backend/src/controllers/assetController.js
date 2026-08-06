const Asset = require('../models/Asset');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const getAssets = asyncWrapper(async (req, res) => {
  const assets = await Asset.find().populate('assignedTo', 'firstName lastName employeeId');
  return ApiResponse.success(res, 'Assets fetched', assets);
});

const createAsset = asyncWrapper(async (req, res) => {
  const asset = await Asset.create(req.body);
  return ApiResponse.success(res, 'Asset added', asset, 201);
});

module.exports = { getAssets, createAsset };
