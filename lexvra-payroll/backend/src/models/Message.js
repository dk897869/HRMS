const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  content: { type: String, default: '' },
  messageType: { type: String, enum: ['TEXT', 'FILE', 'IMAGE', 'VOICE', 'SYSTEM'], default: 'TEXT' },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: String },
  voiceDuration: { type: String },
  status: { type: String, enum: ['SENT', 'DELIVERED', 'SEEN'], default: 'SENT' },
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  reactions: [{
    emoji: { type: String },
    count: { type: Number, default: 1 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
  }],
  isDeleted: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

// Removing TTL index so chat persists like Enterprise platforms
// messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Message', messageSchema);
