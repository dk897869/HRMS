const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

const missingFunctions = `
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

  const handleSendMessage = async () => {
    if (!activeChat) return;
    if (!msgInput.trim() && !selectedFile) return;
    
    const contentToSend = msgInput;
    const fileToSend = selectedFile;
    
    setMsgInput('');
    clearSelectedFile();
    if (socket) {
      socket.emit('stop_typing', { conversationId: activeChat._id, userId: myEmployeeId });
    }

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let messageType = 'TEXT';
      
      if (fileToSend) {
        const formData = new FormData();
        formData.append('file', fileToSend);
        
        const uploadRes = await axiosClient.post('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.success) {
          fileUrl = uploadRes.data.fileUrl;
          fileName = uploadRes.data.fileName;
          fileSize = (uploadRes.data.fileSize / 1024 / 1024).toFixed(2) + ' MB';
          messageType = 'FILE';
        }
      }

      await axiosClient.post('/chat/messages', {
        conversationId: activeChat._id,
        senderId: myEmployeeId,
        content: contentToSend || fileName,
        messageType,
        fileUrl,
        fileName,
        fileSize
      });
    } catch (error) {
      toast.error('Failed to send message');
      setMsgInput(contentToSend); 
      setSelectedFile(fileToSend);
    }
  };
`;

if (!content.includes('const handleSendMessage = async')) {
  content = content.replace(
    'const handleTyping = (e) => {',
    missingFunctions + '\n  const handleTyping = (e) => {'
  );
  fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
}
