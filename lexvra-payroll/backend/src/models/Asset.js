const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assetCode: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, enum: ['Laptop', 'Desktop', 'Mobile', 'Monitor', 'Furniture', 'Peripheral', 'Other'], default: 'Laptop' },
  serialNumber: { type: String },
  purchaseDate: { type: Date },
  value: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  assignedDate: { type: Date },
  status: { type: String, enum: ['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'DISPOSED'], default: 'AVAILABLE' },
  condition: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'], default: 'GOOD' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
