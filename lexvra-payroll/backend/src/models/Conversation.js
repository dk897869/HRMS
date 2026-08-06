const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  isGroup: { type: Boolean, default: false },
  isChannel: { type: Boolean, default: false }, // for company-wide channels
  groupName: { type: String, trim: true },
  groupDescription: { type: String },
  groupAvatar: { type: String }, // Hex color or URL
  groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // who pinned the latest message
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  } // Map of userId -> count
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
