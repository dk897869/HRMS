const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const getJobs = asyncWrapper(async (req, res) => {
  const jobs = await JobPosting.find().populate('department');
  return ApiResponse.success(res, 'Jobs retrieved', jobs);
});

const createJob = asyncWrapper(async (req, res) => {
  const job = await JobPosting.create(req.body);
  return ApiResponse.success(res, 'Job posted successfully', job, 201);
});

const getCandidates = asyncWrapper(async (req, res) => {
  const candidates = await Candidate.find().populate('job');
  return ApiResponse.success(res, 'Candidates retrieved', candidates);
});

const updateCandidateStage = asyncWrapper(async (req, res) => {
  const { stage, rating } = req.body;
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, { stage, rating }, { new: true });
  return ApiResponse.success(res, 'Candidate status updated', candidate);
});

module.exports = { getJobs, createJob, getCandidates, updateCandidateStage };
