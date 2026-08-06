const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Employee = require('../models/Employee');
const { getIO } = require('../sockets/socketHandler');

exports.getConversations = async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    if (!employeeId) return res.status(400).json({ success: false, message: 'Employee ID is required' });

    const conversations = await Conversation.find({ participants: employeeId })
      .populate({
        path: 'participants',
        select: 'firstName lastName avatar designation department email phone location workAddress employeeId',
        populate: [
          { path: 'designation', select: 'title name' },
          { path: 'department', select: 'name' }
        ]
      })
      .populate('groupAdmin', 'firstName lastName')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'firstName lastName' }
      })
      .sort({ updatedAt: -1 });

    // Filter out conversations where all participants no longer exist (e.g., deleted employees)
    const valid = conversations.filter(c => {
      if (c.isGroup) return true;
      const others = c.participants.filter(p => p && p._id && p._id.toString() !== employeeId);
      return others.length > 0 && others.some(o => o.firstName);
    });

    res.status(200).json({ success: true, conversations: valid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChatUsers = async (req, res) => {
  try {
    const employees = await Employee.find({})
      .select('firstName lastName avatar designation department email phone location workAddress role employeeId')
      .populate('designation', 'title name')
      .populate('department', 'name')
      .sort({ firstName: 1 })
      .lean();
    res.status(200).json({ success: true, employees, total: employees.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);
    res.status(200).json({ success: true, message: 'Conversation permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { participants, isGroup } = req.body;
    if (!participants || participants.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 participants required' });
    }
    // Check if DM conversation already exists between these two participants
    if (!isGroup) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      }).populate({
        path: 'participants',
        select: 'firstName lastName avatar designation department email phone location employeeId',
        populate: [
          { path: 'designation', select: 'name' },
          { path: 'department', select: 'name' }
        ]
      });
      if (existing) {
        return res.status(200).json({ success: true, conversation: existing, isExisting: true });
      }
    }
    // Create new conversation
    const conversation = await Conversation.create({ participants, isGroup: isGroup || false });
    const populated = await Conversation.findById(conversation._id)
      .populate({
        path: 'participants',
        select: 'firstName lastName avatar designation department email phone location employeeId',
        populate: [
          { path: 'designation', select: 'name' },
          { path: 'department', select: 'name' }
        ]
      });
    res.status(201).json({ success: true, conversation: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const employeeId = req.query.employeeId;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'firstName lastName avatar')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    // Mark all unread messages as SEEN for this user
    if (employeeId) {
      await Message.updateMany(
        { conversationId, sender: { $ne: employeeId }, readBy: { $ne: employeeId } },
        { $push: { readBy: employeeId }, $set: { status: 'SEEN' } }
      );

      // Reset unread count for this user in the conversation
      const convo = await Conversation.findById(conversationId);
      if (convo && convo.unreadCounts && convo.unreadCounts.has(employeeId)) {
        convo.unreadCounts.set(employeeId, 0);
        await convo.save();
      }
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content, messageType, fileUrl, fileName, fileSize, voiceDuration, participants } = req.body;
    let convoId = conversationId;

    if (!convoId && participants && participants.length === 2) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants }
      });
      if (existing) {
        convoId = existing._id;
      } else {
        const newConvo = new Conversation({ participants, isGroup: false });
        // Set initial unread map
        participants.forEach(p => newConvo.unreadCounts.set(p, 0));
        await newConvo.save();
        convoId = newConvo._id;
      }
    }

    if (!convoId) return res.status(400).json({ success: false, message: 'Invalid conversation parameters' });

    const message = new Message({
      conversationId: convoId,
      sender: senderId,
      content,
      messageType: (messageType || 'TEXT').toString().toUpperCase(),
      fileUrl,
      fileName,
      fileSize,
      voiceDuration,
      status: 'SENT'
    });
    await message.save();

    // Increment unread counts for all other participants
    const convo = await Conversation.findById(convoId);
    if (convo) {
      convo.lastMessage = message._id;
      convo.updatedAt = Date.now();
      
      convo.participants.forEach(pId => {
        if (pId.toString() !== senderId) {
          const currentCount = convo.unreadCounts.get(pId.toString()) || 0;
          convo.unreadCounts.set(pId.toString(), currentCount + 1);
        }
      });
      await convo.save();
    }

    const populatedMsg = await Message.findById(message._id).populate('sender', 'firstName lastName avatar');

    // Socket emission
    try {
      const io = getIO();
      if (io) {
        // Emit to chat room
        io.to(`chat_${convoId}`).emit('new_chat_message', populatedMsg);
        
        // Emit notification to user rooms
        if (convo && convo.participants) {
          convo.participants.forEach(pId => {
            if (pId.toString() !== senderId) {
               io.to(`user_${pId.toString()}`).emit('chat_notification', {
                 conversationId: convoId,
                 message: populatedMsg
               });
            }
          });
        }
      }
    } catch (err) {
      console.error('Socket emission error', err);
    }

    res.status(201).json({ success: true, message: populatedMsg, conversationId: convoId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { groupName, groupDescription, participants, adminId } = req.body;
    const newConvo = new Conversation({
      participants,
      isGroup: true,
      groupName,
      groupDescription,
      groupAdmin: [adminId]
    });
    
    participants.forEach(p => newConvo.unreadCounts.set(p.toString(), 0));
    await newConvo.save();

    res.status(201).json({ success: true, conversation: newConvo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/chats/${req.file.filename}`;
    res.status(200).json({ success: true, fileUrl, fileName: req.file.originalname, fileSize: req.file.size });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearChat = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: null });
    res.status(200).json({ success: true, message: 'Chat cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.reactToMessage = async (req, res) => {
  try {
    const { messageId, emoji, userId } = req.body;
    const Message = require('../models/Message');
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    let reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIndex > -1) {
      // Emoji exists, check if user already reacted
      const userIndex = message.reactions[reactionIndex].users.indexOf(userId);
      if (userIndex > -1) {
        // Remove reaction
        message.reactions[reactionIndex].users.splice(userIndex, 1);
        message.reactions[reactionIndex].count -= 1;
        if (message.reactions[reactionIndex].count === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        // Add reaction
        message.reactions[reactionIndex].users.push(userId);
        message.reactions[reactionIndex].count += 1;
      }
    } else {
      // New emoji
      message.reactions.push({ emoji, count: 1, users: [userId] });
    }

    await message.save();
    
    // Broadcast
    const { getIO } = require('../sockets/socketHandler');
    const io = getIO();
    if (io) {
      io.to(`chat_${message.conversationId}`).emit('message_reaction_updated', { messageId, reactions: message.reactions });
    }

    res.status(200).json({ success: true, reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, type } = req.query; // type can be 'everyone' or 'me'
    
    const Message = require('../models/Message');
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (type === 'everyone' && message.sender.toString() === userId) {
      message.isDeleted = true;
      message.content = 'This message was deleted.';
      await message.save();
      
      const { getIO } = require('../sockets/socketHandler');
      const io = getIO();
      if (io) {
        io.to(`chat_${message.conversationId}`).emit('message_deleted', { messageId, type: 'everyone' });
      }
    } else {
      if (type === 'everyone') {
         return res.status(403).json({ success: false, message: 'Not authorized to delete for everyone' });
      }
    }
    
    res.status(200).json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


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

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const employeeId = req.body.employeeId || (req.user && (req.user.employeeRef || req.user._id));
    if (employeeId) {
      await Employee.findByIdAndUpdate(employeeId, { avatar: avatarUrl });
    }
    res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
