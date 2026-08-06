const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// Add new imports for date formatting
content = content.replace(
  `import { useSelector } from 'react-redux';`,
  `import { useSelector } from 'react-redux';\nimport moment from 'moment';`
);

// Replace state variables
content = content.replace(
  `  // States for UI Shell\n  const [leftTab, setLeftTab] = useState(0);\n  const [rightTab, setRightTab] = useState(0);\n  const [msgInput, setMsgInput] = useState('');\n  const [aiInput, setAiInput] = useState('');`,
  `  // States for UI Shell
  const [leftTab, setLeftTab] = useState(0);
  const [rightTab, setRightTab] = useState(0);
  const [msgInput, setMsgInput] = useState('');
  const [aiInput, setAiInput] = useState('');
  
  // Real Data States
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const activeChatRef = useRef(activeChat);

  // Sync activeChatRef
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Connect Socket & Fetch Conversations
  useEffect(() => {
    if (!myEmployeeId) return;

    // 1. Fetch Conversations
    const fetchConvos = async () => {
      try {
        const res = await axiosClient.get(\`/chat/conversations?employeeId=\${myEmployeeId}\`);
        if (res.data.success) {
          setConversations(res.data.conversations);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };
    fetchConvos();

    // 2. Setup Socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', myEmployeeId);
    });

    newSocket.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_online_status', ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === 'ONLINE' && !prev.includes(userId)) return [...prev, userId];
        if (status === 'OFFLINE') return prev.filter(id => id !== userId);
        return prev;
      });
    });

    newSocket.on('chat_notification', ({ conversationId, message }) => {
      fetchConvos(); // Refresh list to update unread count and last message
    });

    newSocket.on('new_chat_message', (msg) => {
      // If the message belongs to the currently active chat
      if (activeChatRef.current && activeChatRef.current._id === msg.conversationId) {
        setMessages(prev => [...prev, msg]);
        // Tell server we read it
        if (msg.sender._id !== myEmployeeId) {
          newSocket.emit('mark_as_read', { messageId: msg._id, conversationId: msg.conversationId, userId: myEmployeeId });
        }
      } else {
        // Refresh conversations to show unread badge
        fetchConvos();
      }
    });

    newSocket.on('user_typing', ({ conversationId, userName }) => {
      setTypingUsers(prev => ({ ...prev, [conversationId]: userName }));
    });

    newSocket.on('user_stopped_typing', ({ conversationId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    });

    return () => newSocket.disconnect();
  }, [myEmployeeId]);

  // Fetch Messages when activeChat changes
  useEffect(() => {
    if (!activeChat || !myEmployeeId) return;
    
    const fetchMsgs = async () => {
      try {
        const res = await axiosClient.get(\`/chat/messages/\${activeChat._id}?employeeId=\${myEmployeeId}\`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMsgs();

    if (socket) {
      socket.emit('join_chat', activeChat._id);
    }

    return () => {
      if (socket && activeChat) {
        socket.emit('leave_chat', activeChat._id);
      }
    }
  }, [activeChat, myEmployeeId, socket]);

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !activeChat) return;
    
    const content = msgInput;
    setMsgInput('');
    socket.emit('stop_typing', { conversationId: activeChat._id, userId: myEmployeeId });

    try {
      await axiosClient.post('/chat/messages', {
        conversationId: activeChat._id,
        senderId: myEmployeeId,
        content,
        messageType: 'TEXT'
      });
      // The socket will broadcast it back to us via 'new_chat_message'
    } catch (error) {
      toast.error('Failed to send message');
      setMsgInput(content); // Restore on fail
    }
  };

  const handleTyping = (e) => {
    setMsgInput(e.target.value);
    if (socket && activeChat) {
      if (e.target.value.trim() !== '') {
        socket.emit('typing', { conversationId: activeChat._id, userName: user?.firstName, userId: myEmployeeId });
      } else {
        socket.emit('stop_typing', { conversationId: activeChat._id, userId: myEmployeeId });
      }
    }
  };
`
);

content = content.replace(
  `  const user = useSelector((state) => state.auth.user);`,
  `  const user = useSelector((state) => state.auth.user);\n  const myEmployeeId = user?.employeeRef?._id || user?.employeeRef;`
);

// Map Recent Chats to use real 'conversations'
const replaceRecentRegex = /\{\/\* Recent Section \*\/\}.*?\{\/\* Direct Messages Section \*\/\}/s;
content = content.replace(
  replaceRecentRegex,
  `{/* Recent Section */}
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', mt: 3, mb: 1.5, px: 1 }}>Recent</Typography>
          {conversations.map((chat) => {
            const isGroup = chat.isGroup;
            const otherParticipant = chat.participants.find(p => p._id !== myEmployeeId);
            const chatName = isGroup ? chat.groupName : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');
            const chatAvatarSrc = isGroup ? chat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);
            const chatAvatarInitials = isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase();
            const unreadCount = (chat.unreadCounts && chat.unreadCounts[myEmployeeId]) || 0;
            const lastMsgContent = chat.lastMessage?.content || (chat.lastMessage?.messageType === 'FILE' ? 'Sent a file' : (chat.lastMessage?.messageType === 'VOICE' ? 'Voice note' : 'No messages yet'));
            const timeStr = chat.lastMessage?.createdAt ? moment(chat.lastMessage.createdAt).format('h:mm A') : '';
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

          {/* Direct Messages Section */}
`
);

// Map Active Chat Header
const replaceHeaderRegex = /\{\/\* Chat Header \*\/\}.*?\{\/\* Pinned Banner \*\/\}/s;
content = content.replace(
  replaceHeaderRegex,
  `{/* Chat Header */}
        <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF', zIndex: 10 }}>
          {activeChat ? (() => {
            const isGroup = activeChat.isGroup;
            const otherParticipant = activeChat.participants.find(p => p._id !== myEmployeeId);
            const chatName = isGroup ? activeChat.groupName : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');
            const chatAvatarSrc = isGroup ? activeChat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);
            const chatAvatarInitials = isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase();
            const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id);
            const statusText = isGroup ? \`\${activeChat.participants.length} members\` : (isOnline ? 'Online' : 'Offline');
            
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={chatAvatarSrc} sx={{ bgcolor: isGroup ? '#4F46E5' : '#8B5CF6', width: 46, height: 46, fontWeight: 700, fontSize: '1.2rem', mr: 2 }}>{chatAvatarInitials}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>{chatName}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {(!isGroup && isOnline) && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />} {statusText}
                  </Typography>
                </Box>
              </Box>
            );
          })() : <Box sx={{ display: 'flex', alignItems: 'center' }}><Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>Select a chat</Typography></Box>}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton sx={{ color: '#475569', bgcolor: '#F8FAFC', borderRadius: '10px' }}><VideocamIcon /></IconButton>
            <IconButton sx={{ color: '#475569', bgcolor: '#F8FAFC', borderRadius: '10px' }}><CallIcon /></IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: '#E2E8F0' }} />
            <IconButton sx={{ color: '#475569' }}><SearchIcon /></IconButton>
            <IconButton sx={{ color: '#475569' }}><GroupIcon /></IconButton>
            <IconButton sx={{ color: '#475569' }}><PushPinOutlinedIcon /></IconButton>
            <IconButton sx={{ color: '#475569' }}><MoreVertIcon /></IconButton>
          </Box>
        </Box>

        {/* Pinned Banner */}
`
);

// Map Messages
const replaceMessagesRegex = /\{\/\* Render Messages \*\/\}.*?\{\/\* Typing Indicator \*\/\}/s;
content = content.replace(
  replaceMessagesRegex,
  `{/* Render Messages */}
          {!activeChat && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <ChatIcon sx={{ fontSize: '4rem', color: '#E2E8F0', mb: 2 }} />
              <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>Select a conversation from the left to start messaging</Typography>
            </Box>
          )}

          {activeChat && messages.map((msg) => {
            const isMe = msg.sender._id === myEmployeeId;
            const senderName = isMe ? 'You' : \`\${msg.sender.firstName} \${msg.sender.lastName}\`;
            const senderAvatar = msg.sender.avatar ? \`http://localhost:5000\${msg.sender.avatar}\` : null;
            const senderInitials = senderName.substring(0, 1).toUpperCase();
            const timeStr = moment(msg.createdAt).format('h:mm A');
            const isReadByOthers = msg.readBy && msg.readBy.length > 0;

            return (
              <Box key={msg._id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', maxWidth: '85%', alignSelf: isMe ? 'flex-end' : 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <Avatar src={senderAvatar} sx={{ width: 40, height: 40, bgcolor: isMe ? '#4F46E5' : '#8B5CF6' }}>{senderInitials}</Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{senderName}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{timeStr}</Typography>
                  </Box>
                  
                  {/* Text Message */}
                  {msg.messageType === 'TEXT' && (
                    <Box sx={{ p: 2, bgcolor: isMe ? '#4F46E5' : '#F8FAFC', borderRadius: isMe ? '16px 0 16px 16px' : '0 16px 16px 16px', color: isMe ? '#FFF' : '#0F172A', fontSize: '0.95rem', lineHeight: 1.5, position: 'relative' }}>
                      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                      {isMe && <DoneAllIcon sx={{ fontSize: '1rem', color: isReadByOthers ? '#34D399' : '#A5B4FC', position: 'absolute', bottom: 6, right: 8 }} />}
                    </Box>
                  )}

                  {/* Reactions Placeholder */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      {msg.reactions.map((reaction, i) => (
                        <Chip key={i} size="small" label={\`\${reaction.emoji} \${reaction.count}\`} sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '0.75rem', height: 24, borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
          
          {/* Typing Indicator */}
`
);

// Map Input Handlers & Typing Indicator
const replaceInputRegex = /onChange=\{\(e\) => setMsgInput\(e.target.value\)\}/g;
content = content.replace(replaceInputRegex, `onChange={handleTyping} onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}`);

const replaceSendRegex = /\<IconButton \n              sx=\{\{ \n                bgcolor: '#4F46E5', color: '#FFF', mr: 0.5,\n                '&:hover': \{ bgcolor: '#4338CA' \} \n              \}\}\n            \>/s;
content = content.replace(replaceSendRegex, `<IconButton onClick={handleSendMessage} disabled={!activeChat} sx={{ bgcolor: '#4F46E5', color: '#FFF', mr: 0.5, '&:hover': { bgcolor: '#4338CA' }, '&.Mui-disabled': { bgcolor: '#94A3B8' } }}>`);

const replaceTypingUIRegex = /<Typography sx=\{\{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 \}\}>Neha Sharma is typing...<\/Typography>/g;
content = content.replace(replaceTypingUIRegex, `{activeChat && typingUsers[activeChat._id] ? <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>{typingUsers[activeChat._id]} is typing...</Typography> : null}`);

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
