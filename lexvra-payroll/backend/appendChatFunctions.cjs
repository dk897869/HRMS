const fs = require('fs');
let content = fs.readFileSync('src/controllers/chatController.js', 'utf8');

const newFunctions = `
exports.pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { isPinned } = req.body; // true to pin, false to unpin
    
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    
    message.isPinned = isPinned;
    await message.save();
    
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      if (isPinned) {
        if (!conversation.pinnedMessages.includes(messageId)) {
          conversation.pinnedMessages.push(messageId);
        }
        conversation.pinnedBy = req.user.employeeRef;
      } else {
        conversation.pinnedMessages = conversation.pinnedMessages.filter(id => id.toString() !== messageId.toString());
      }
      await conversation.save();
    }
    
    // Broadcast via socket
    const io = require('../sockets/socketHandler').getIO();
    io.to(message.conversationId.toString()).emit('message_pinned', { messageId, isPinned, conversationId: message.conversationId });
    
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchChats = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, messages: [], conversations: [] });
    
    const regex = new RegExp(q, 'i');
    
    // Search messages in conversations the user is part of
    const userConvos = await Conversation.find({ participants: req.user.employeeRef }).select('_id');
    const convoIds = userConvos.map(c => c._id);
    
    const messages = await Message.find({
      conversationId: { $in: convoIds },
      content: { $regex: regex }
    }).populate('sender', 'firstName lastName avatar').sort({ createdAt: -1 }).limit(20);
    
    // Search conversations by groupName
    const conversations = await Conversation.find({
      participants: req.user.employeeRef,
      groupName: { $regex: regex }
    }).populate('participants', 'firstName lastName avatar designation');
    
    res.json({ success: true, messages, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const { groupName, groupDescription } = req.body;
    
    // Typically channels include all employees. Let's fetch all employees.
    const Employee = require('../models/Employee');
    const allEmps = await Employee.find().select('_id');
    const participantIds = allEmps.map(e => e._id);
    
    const newChannel = new Conversation({
      isGroup: true,
      isChannel: true,
      groupName,
      groupDescription,
      participants: participantIds,
      groupAdmin: [req.user.employeeRef]
    });
    
    await newChannel.save();
    
    // Populate for response
    await newChannel.populate('participants', 'firstName lastName avatar designation');
    
    res.json({ success: true, channel: newChannel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;

content = content + '\n' + newFunctions;
fs.writeFileSync('src/controllers/chatController.js', content);
