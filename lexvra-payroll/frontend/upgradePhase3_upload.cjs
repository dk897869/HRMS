const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// 1. Add state for file
content = content.replace(
  `const [aiInput, setAiInput] = useState('');`,
  `const [aiInput, setAiInput] = useState('');\n  const [selectedFile, setSelectedFile] = useState(null);\n  const fileInputRef = useRef(null);`
);

// 2. Add handleFileUpload function
content = content.replace(
  `const handleReactToMessage = async (messageId, emoji) => {`,
  `
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if (!activeChat) return;
    if (!msgInput.trim() && !selectedFile) return;
    
    const content = msgInput;
    const fileToSend = selectedFile;
    
    setMsgInput('');
    clearSelectedFile();
    socket.emit('stop_typing', { conversationId: activeChat._id, userId: myEmployeeId });

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
        content: content || fileName,
        messageType,
        fileUrl,
        fileName,
        fileSize
      });
    } catch (error) {
      toast.error('Failed to send message');
      setMsgInput(content); 
      setSelectedFile(fileToSend);
    }
  };

  const handleReactToMessage = async (messageId, emoji) => {`
);

// Remove the old handleSendMessage block to avoid duplicates
const handleSendOldRegex = /const handleSendMessage = async \(\) => \{[\s\S]*?toast\.error\('Failed to send message'\);\n      setMsgInput\(content\); \/\/ Restore on fail\n    \}\n  \};/m;
// Wait, my replacement above just inserted the new handleSendMessage before handleReactToMessage. The OLD handleSendMessage is still further down! Let me replace the specific OLD handleSendMessage with empty string.

content = content.replace(handleSendOldRegex, ``);

// 3. Render the file attachment icon UI properly with file input
content = content.replace(
  `<IconButton sx={{ color: '#94A3B8' }}><AttachFileIcon /></IconButton>`,
  `
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: selectedFile ? '#4F46E5' : '#94A3B8', bgcolor: selectedFile ? '#EEF2FF' : 'transparent' }}>
                  <AttachFileIcon />
                </IconButton>
  `
);

// 4. Render selected file banner above the input field
content = content.replace(
  `<Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'flex-end', gap: 1 }}>`,
  `
          {selectedFile && (
            <Box sx={{ px: 3, py: 1, bgcolor: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DocumentIcon sx={{ color: '#4F46E5' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{selectedFile.name}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</Typography>
              </Box>
              <IconButton size="small" onClick={clearSelectedFile}><CloseIcon fontSize="small" /></IconButton>
            </Box>
          )}
          <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'flex-end', gap: 1 }}>`
);

// 5. Render file messages properly in the chat bubble
content = content.replace(
  `{/* Text Message */}
                  {msg.messageType === 'TEXT' && (`,
  `
                  {/* File Message */}
                  {msg.messageType === 'FILE' && !msg.isDeleted && (
                    <Box sx={{ p: 2, bgcolor: isMe ? '#4F46E5' : '#F8FAFC', borderRadius: isMe ? '16px 0 16px 16px' : '0 16px 16px 16px', color: isMe ? '#FFF' : '#0F172A', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: isMe ? 'rgba(255,255,255,0.2)' : '#E2E8F0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <FilePdfIcon sx={{ color: isMe ? '#FFF' : '#475569' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{msg.fileName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: isMe ? 'rgba(255,255,255,0.7)' : '#64748B' }}>{msg.fileSize}</Typography>
                      </Box>
                      <IconButton size="small" sx={{ ml: 2, bgcolor: isMe ? 'rgba(255,255,255,0.2)' : '#E2E8F0', color: isMe ? '#FFF' : '#0F172A' }} onClick={() => window.open('http://localhost:5000' + msg.fileUrl, '_blank')}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Text Message */}
                  {msg.messageType === 'TEXT' && (`
);

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
