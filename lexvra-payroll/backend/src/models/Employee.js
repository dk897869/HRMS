const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  dob: { type: Date },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
  joiningDate: { type: Date, required: true },
  probationPeriod: { type: String, trim: true },
  confirmationDate: { type: Date },
  employmentStatus: {
    type: String,
    enum: ['ACTIVE', 'PROBATION', 'SUSPENDED', 'NOTICE_PERIOD', 'TERMINATED', 'RESIGNED'],
    default: 'ACTIVE'
  },
  employmentType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
    default: 'FULL_TIME'
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reportingManagerName: { type: String, trim: true },

  // Work / Org placement details
  workLocation: { type: String, trim: true },
  workShift: { type: String, trim: true },
  businessUnit: { type: String, trim: true },
  workAddress: { type: String, trim: true },

  // Additional personal info
  bloodGroup: { type: String, trim: true },
  nationality: { type: String, trim: true, default: 'Indian' },
  languages: { type: String, trim: true },

  // Personal & Statutory Details
  panNumber: { type: String, uppercase: true, trim: true },
  aadhaarNumber: { type: String, trim: true },
  uanNumber: { type: String, trim: true },
  isPfEligible: { type: Boolean, default: false },
  esiNumber: { type: String, trim: true },
  isEsiEligible: { type: Boolean, default: false },
  passportNumber: { type: String, uppercase: true },
  visaDetails: { type: String },

  // Bank & Salary Details
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  ifscCode: { type: String, uppercase: true, trim: true },
  accountType: { type: String, enum: ['Savings', 'Current'], default: 'Savings' },
  ctc: { type: Number, default: 0 }, // Annual CTC in INR
  baseSalary: { type: Number, default: 0 }, // Monthly Base

  // Emergency Contact & Family
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },

  avatar: { type: String },
  documents: [{
    title: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const EPF_EMPLOYEE_RATE = 0.12; // Statutory employee EPF contribution: 12% of basic/base salary
const EPF_EMPLOYER_RATE = 0.12; // Standard matching employer contribution

// Monthly EPF amount deducted from the employee's base salary, only when EPF is enabled
employeeSchema.virtual('epfDeduction').get(function () {
  if (!this.isPfEligible || !this.baseSalary) return 0;
  return Math.round(this.baseSalary * EPF_EMPLOYEE_RATE);
});

// Employer's matching EPF contribution (informational, not deducted from employee salary)
employeeSchema.virtual('epfEmployerContribution').get(function () {
  if (!this.isPfEligible || !this.baseSalary) return 0;
  return Math.round(this.baseSalary * EPF_EMPLOYER_RATE);
});

module.exports = mongoose.model('Employee', employeeSchema);
