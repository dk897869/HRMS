const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// 1. Add employees state
content = content.replace(
  `const [conversations, setConversations] = useState([]);`,
  `const [conversations, setConversations] = useState([]);\n  const [allEmployees, setAllEmployees] = useState([]);`
);

// 2. Fetch employees
content = content.replace(
  `const fetchConvos = async () => {`,
  `const fetchEmployees = async () => {
      try {
        const res = await axiosClient.get('/employees');
        if (res.data.success) {
          setAllEmployees(res.data.employees.filter(emp => emp._id !== myEmployeeId));
        }
      } catch (error) {
        console.error('Failed to fetch employees', error);
      }
    };
    fetchEmployees();

    const fetchConvos = async () => {`
);

// 3. Add handleStartNewChat
content = content.replace(
  `const handleTyping = (e) => {`,
  `const handleStartNewChat = async (employee) => {
    // Check if conversation already exists
    const existing = conversations.find(c => !c.isGroup && c.participants.some(p => p._id === employee._id));
    if (existing) {
      setActiveChat(existing);
      return;
    }
    
    // Otherwise create a new direct message conversation locally (will be saved to DB on first message)
    // Actually, backend might need to create it, or we just set activeChat to a dummy object
    // A better way is to just set activeChat with participants
    setActiveChat({
      isNew: true,
      isGroup: false,
      participants: [user.employeeRef, employee],
      _id: 'new_' + employee._id
    });
  };

  const handleNotImplemented = () => {
    toast('Feature coming soon!', { icon: '🚧' });
  };

  const handleTyping = (e) => {`
);

// 4. Update Left Sidebar rendering to show Employees if tab === 2 (Direct)
const recentSectionRegex = /\{\/\* Recent Section \*\/\}.*?<Typography.*?<\/Typography>\n\s*\{conversations\.filter[\s\S]*?\}\)\}/s;
content = content.replace(recentSectionRegex, `{/* Recent Section */}
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', mt: 3, mb: 1.5, px: 1 }}>{leftTab === 0 ? 'Recent' : leftTab === 1 ? 'Groups' : leftTab === 2 ? 'Direct Messages & Employees' : 'Channels'}</Typography>
          
          {conversations.filter(c => {
             if (leftTab === 0) return true;
             if (leftTab === 1) return c.isGroup && !c.isChannel;
             if (leftTab === 2) return !c.isGroup;
             if (leftTab === 3) return c.isGroup && c.isChannel;
             return true;
          }).map((chat) => {
            const isGroup = chat.isGroup;
            const otherParticipant = (chat.participants || []).find(p => p._id !== myEmployeeId);
            const chatName = isGroup ? (chat.groupName || 'Group') : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');
            const chatAvatarSrc = isGroup ? chat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);
            const chatAvatarInitials = chatName ? (isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase()) : 'U';
            const unreadCount = (chat.unreadCounts && chat.unreadCounts[myEmployeeId]) || 0;
            const lastMsgContent = chat.lastMessage?.content || (chat.lastMessage?.messageType === 'FILE' ? 'Sent a file' : (chat.lastMessage?.messageType === 'VOICE' ? 'Voice note' : 'No messages yet'));
            const timeStr = chat.lastMessage?.createdAt ? formatTime(chat.lastMessage.createdAt) : '';
            const isActive = activeChat?._id === chat._id;
            const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id);

            return (
              <Box key={chat._id} onClick={() => setActiveChat(chat)} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1, borderRadius: '12px', cursor: 'pointer', bgcolor: isActive ? '#F5F3FF' : 'transparent', '&:hover': { bgcolor: isActive ? '#F5F3FF' : '#F8FAFC' } }}>
                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!isOnline} sx={{ '& .MuiBadge-badge': { backgroundColor: '#10B981', color: '#10B981', boxShadow: '0 0 0 2px #FFFFFF' } }}>
                  <Avatar src={chatAvatarSrc} sx={{ bgcolor: isGroup ? '#4F46E5' : '#8B5CF6', width: 42, height: 42, fontWeight: 700, fontSize: '1.1rem' }}>{chatAvatarInitials}</Avatar>
                </Badge>
                <Box sx={{ ml: 2, flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chatName}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: isActive ? '#4F46E5' : '#94A3B8', fontWeight: 600 }}>{timeStr}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: unreadCount > 0 ? '#0F172A' : '#64748B', fontWeight: unreadCount > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsgContent}</Typography>
                </Box>
                {unreadCount > 0 && <Badge badgeContent={unreadCount} color="primary" sx={{ ml: 2, '& .MuiBadge-badge': { bgcolor: '#4F46E5', color: 'white', fontWeight: 700 } }} />}
              </Box>
            );
          })}

          {/* New Chat Directory - Only show in Direct tab */}
          {leftTab === 2 && (
             <Box sx={{ mt: 3 }}>
               <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', mb: 1, px: 1 }}>Company Directory</Typography>
               {allEmployees.map(emp => (
                 <Box key={emp._id} onClick={() => handleStartNewChat(emp)} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1, borderRadius: '12px', cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' } }}>
                   <Avatar src={emp.avatar ? \`http://localhost:5000\${emp.avatar}\` : null} sx={{ bgcolor: '#94A3B8', width: 36, height: 36, fontSize: '0.9rem' }}>{emp.firstName.substring(0,1)}{emp.lastName.substring(0,1)}</Avatar>
                   <Box sx={{ ml: 2, flexGrow: 1 }}>
                     <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>{emp.firstName} {emp.lastName}</Typography>
                     <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{emp.designation || 'Employee'}</Typography>
                   </Box>
                 </Box>
               ))}
             </Box>
          )}
`);

// 5. Wire up the bottom toolbar buttons (Emoji, GIF, Camera, Mic)
// Look for the specific icon buttons in the input area
content = content.replace(
  /<IconButton sx=\{\{ color: '#94A3B8' \}\}>\s*<EmojiIcon \/>\s*<\/IconButton>/,
  `<IconButton onClick={handleNotImplemented} sx={{ color: '#94A3B8' }}><EmojiIcon /></IconButton>`
);
content = content.replace(
  /<IconButton sx=\{\{ color: '#94A3B8' \}\}>\s*<GifIcon \/>\s*<\/IconButton>/,
  `<IconButton onClick={handleNotImplemented} sx={{ color: '#94A3B8' }}><GifIcon /></IconButton>`
);
content = content.replace(
  /<IconButton sx=\{\{ color: '#94A3B8' \}\}>\s*<CameraIcon \/>\s*<\/IconButton>/,
  `<IconButton onClick={handleNotImplemented} sx={{ color: '#94A3B8' }}><CameraIcon /></IconButton>`
);
content = content.replace(
  /<IconButton sx=\{\{ color: '#94A3B8' \}\}>\s*<MicIcon \/>\s*<\/IconButton>/,
  `<IconButton onClick={handleNotImplemented} sx={{ color: '#94A3B8' }}><MicIcon /></IconButton>`
);

// 6. Handle activeChat._id being "new_xxx" in handleSendMessage
content = content.replace(
  `conversationId: activeChat._id,`,
  `conversationId: activeChat.isNew ? null : activeChat._id,\n        recipientId: activeChat.isNew ? activeChat.participants.find(p => p._id !== myEmployeeId)._id : null,`
);
// Wait, the backend endpoint for /chat/messages needs to handle creating a new conversation if conversationId is null!
// Let's modify the backend chatController.js just in case to support recipientId.
// Actually, it's safer to just let the script update the frontend for now and I'll update the backend next.

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
