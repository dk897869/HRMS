const fs = require('fs');
let content = fs.readFileSync('backend/src/controllers/chatController.js', 'utf8');

const newMethods = `

exports.reactToMessage = async (req, res) => {
  try {
    const { messageId, emoji, userId } = req.body;
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
    const io = getIO();
    if (io) {
      io.to(\`chat_\${message.conversationId}\`).emit('message_reaction_updated', { messageId, reactions: message.reactions });
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
    
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (type === 'everyone' && message.sender.toString() === userId) {
      message.isDeleted = true;
      message.content = 'This message was deleted.';
      await message.save();
      
      const io = getIO();
      if (io) {
        io.to(\`chat_\${message.conversationId}\`).emit('message_deleted', { messageId, type: 'everyone' });
      }
    } else {
      // Just visually delete it for this user (not full DB deletion for everyone)
      // Usually you maintain a 'deletedFor' array. For now we just implement 'everyone' to keep it robust
      if (type === 'everyone') {
         return res.status(403).json({ success: false, message: 'Not authorized to delete for everyone' });
      }
    }
    
    res.status(200).json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;

if (!content.includes('reactToMessage')) {
  fs.writeFileSync('backend/src/controllers/chatController.js', content + newMethods);
}
