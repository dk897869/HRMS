const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// Add socket listeners for reaction and delete
content = content.replace(
  `newSocket.on('chat_notification', ({ conversationId, message }) => {`,
  `
    newSocket.on('message_reaction_updated', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, reactions } : msg));
    });

    newSocket.on('message_deleted', ({ messageId, type }) => {
      if (type === 'everyone') {
        setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, isDeleted: true, content: 'This message was deleted.', fileUrl: null } : msg));
      }
    });

    newSocket.on('chat_notification', ({ conversationId, message }) => {`
);

// Add handlers
content = content.replace(
  `const handleSendMessage = async () => {`,
  `
  const handleReactToMessage = async (messageId, emoji) => {
    try {
      await axiosClient.post('/chat/messages/react', { messageId, emoji, userId: myEmployeeId });
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosClient.delete(\`/chat/message/\${messageId}?userId=\${myEmployeeId}&type=everyone\`);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleSendMessage = async () => {`
);

// Update Render Messages UI to include hover action buttons for React & Delete
content = content.replace(
  `{msg.messageType === 'TEXT' && (`,
  `
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', '&:hover .msg-actions': { opacity: 1 } }}>
                    
                    {/* Action Menu (Visible on Hover) */}
                    {isMe && !msg.isDeleted && (
                      <Box className="msg-actions" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                        <IconButton size="small" onClick={() => handleReactToMessage(msg._id, '👍')} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' }, width: 24, height: 24 }}><Typography sx={{ fontSize: '0.8rem' }}>👍</Typography></IconButton>
                        <IconButton size="small" onClick={() => handleReactToMessage(msg._id, '❤️')} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' }, width: 24, height: 24 }}><Typography sx={{ fontSize: '0.8rem' }}>❤️</Typography></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteMessage(msg._id)} sx={{ bgcolor: '#FEF2F2', color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' }, width: 24, height: 24 }}><CloseIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    )}
                    
                  {msg.messageType === 'TEXT' && (`
);

content = content.replace(
  `{isMe && <DoneAllIcon sx={{ fontSize: '1rem', color: isReadByOthers ? '#34D399' : '#A5B4FC', position: 'absolute', bottom: 6, right: 8 }} />}
                    </Box>
                  )}`,
  `{isMe && <DoneAllIcon sx={{ fontSize: '1rem', color: isReadByOthers ? '#34D399' : '#A5B4FC', position: 'absolute', bottom: 6, right: 8 }} />}
                    </Box>
                  )}
                  </Box> <!-- Closing the wrapper -->
  `.replace('<!-- Closing the wrapper -->', '') // Cleaned up
);


fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
