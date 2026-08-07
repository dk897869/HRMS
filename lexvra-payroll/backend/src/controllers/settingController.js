const Setting = require('../models/Setting');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const getSettings = asyncWrapper(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  } else if (settings.companyName === 'LEXVRA INFINOLOGY PRIVATE LIMITED') {
    settings.companyName = 'PayFlexPayroll';
    settings.companyLogoUrl = '/PayFlexPayroll Logo.png';
    await settings.save();
  }
  return ApiResponse.success(res, 'Settings fetched', settings);
});

const updateSettings = asyncWrapper(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(req.body);
  } else {
    settings = await Setting.findByIdAndUpdate(settings._id, req.body, { new: true });
  }
  return ApiResponse.success(res, 'Settings updated', settings);
});

module.exports = { getSettings, updateSettings };
