import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, TextField, IconButton, Avatar, Button, 
  Chip, Paper, Grid, Tooltip, Divider, Tabs, Tab, Badge, 
  Menu, MenuItem, Modal, Checkbox, FormControlLabel, Popover,
  useTheme, useMediaQuery
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  FilterList as FilterIcon, 
  PushPin as PinIcon, 
  Phone as PhoneIcon, 
  Videocam as VideocamIcon, 
  MoreVert as MoreVertIcon, 
  Close as CloseIcon, 
  EmojiEmotions as EmojiIcon, 
  AttachFile as AttachFileIcon, 
  InsertPhoto as ImageIcon, 
  CameraAlt as CameraIcon, 
  Mic as MicIcon, 
  Send as SendIcon, 
  FileDownload as DownloadIcon, 
  RemoveRedEye as ViewIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon, 
  Person as PersonIcon, 
  AccessTime as AttendanceIcon, 
  ReceiptLong as PayslipIcon, 
  EventAvailable as LeaveIcon, 
  Description as DocumentIcon, 
  TrendingUp as PerformanceIcon, 
  FolderOutlined as FolderIcon, 
  ImageOutlined as PhotoIcon, 
  LinkOutlined as LinkIcon, 
  MicNoneOutlined as VoiceIcon, 
  Block as BlockIcon, 
  Check as CheckIcon, 
  DoneAll as DoneAllIcon,
  ChatOutlined as ChatIcon,
  DeleteOutlined as DeleteIcon,
  ClearAll as ClearIcon,
  PhotoCamera as PhotoCameraIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://lx-hrms-1.onrender.com', { autoConnect: false });

const EMOJI_LIST = ['😊', '👍', '❤️', '🎉', '🔥', '🚀', '👏', '💯', '😂', '🙌', '✨', '💼', '🤝', '✅', '⭐', '💡'];

const getFullMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_SOCKET_URL || 'https://lx-hrms-1.onrender.com'}${url.startsWith('/') ? url : '/' + url}`;
};

const getDesignationLabel = (desig) => {
  if (!desig) return '';
  if (typeof desig === 'object' && desig.title) return desig.title;
  if (typeof desig === 'object' && desig.name) return desig.name;
  if (typeof desig === 'string' && desig.length < 40 && !desig.match(/^[a-f\d]{24}$/i)) return desig;
  return '';
};

const getDepartmentLabel = (dept) => {
  if (!dept) return '';
  if (typeof dept === 'object' && dept.name) return dept.name;
  if (typeof dept === 'string' && dept.length < 40 && !dept.match(/^[a-f\d]{24}$/i)) return dept;
  return '';
};

const Chats = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const myEmployeeId = user?.employeeRef?._id || user?.employeeRef || user?._id;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat' | 'details'

  // Dynamic Data States
  const [conversations, setConversations] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);

  // UI Tabs & Input States
  const [leftTab, setLeftTab] = useState(0); // 0: All, 1: Direct, 2: Groups, 3: Channels
  const [rightTab, setRightTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);
  const [isPlayingAudioId, setIsPlayingAudioId] = useState(null);
  const [typingStatus, setTypingStatus] = useState(null);

  // Popovers & Menus
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);

  // Modal States
  const [activeCall, setActiveCall] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallVideoOff, setIsCallVideoOff] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('group'); // 'group' or 'channel'
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Voice Note Recorder
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // File Refs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call Timer Effect
  useEffect(() => {
    let timer;
    if (activeCall) {
      timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
    } else {
      setCallTime(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  // Connect Socket & Handlers
  useEffect(() => {
    socket.connect();
    if (myEmployeeId) {
      socket.emit('join_room', myEmployeeId);
    }

    socket.on('user_online', (data) => {
      if (data && data.onlineUsers) setOnlineUsers(data.onlineUsers);
    });

    socket.on('receive_message', (newMsg) => {
      if (activeChat && newMsg.conversationId === activeChat._id) {
        setMessages(prev => [...prev, newMsg]);
      }
      fetchConversations();
    });

    socket.on('typing', (data) => {
      if (activeChat && data.conversationId === activeChat._id) {
        setTypingStatus(data.userName);
      }
    });

    socket.on('stop_typing', () => {
      setTypingStatus(null);
    });

    return () => {
      socket.off('user_online');
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop_typing');
      socket.disconnect();
    };
  }, [myEmployeeId, activeChat]);

  // Fetch Conversations & Users from Backend API
  const fetchConversations = async () => {
    if (!myEmployeeId) return;
    try {
      const res = await axiosClient.get(`/chat/conversations?employeeId=${myEmployeeId}`);
      if (res && res.success) {
        setConversations(res.conversations || []);
        if (!activeChat && res.conversations.length > 0) {
          selectConversation(res.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Fetch Conversations Error:', err);
    }
  };

  const fetchDirectoryUsers = async () => {
    try {
      const res = await axiosClient.get('/chat/users');
      if (res && res.success) {
        setDirectoryUsers(res.employees || []);
      }
    } catch (err) {
      console.error('Fetch Directory Error:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchDirectoryUsers();
  }, [myEmployeeId]);

  // Select or Create Conversation
  const selectConversation = async (convo) => {
    setActiveChat(convo);
    setIsBlocked(false);
    fetchMessages(convo._id);
    if (isMobile) {
      setMobileView('chat');
    }
  };

  const startConversationWithUser = async (targetUser) => {
    try {
      const res = await axiosClient.post('/chat/conversations', {
        participants: [myEmployeeId, targetUser._id],
        isGroup: false
      });
      if (res && res.success) {
        await fetchConversations();
        selectConversation(res.conversation);
        if (isMobile) setMobileView('chat');
      }
    } catch (err) {
      console.error('Start Conversation Error:', err);
      toast.error('Could not open conversation');
    }
  };

  // Fetch Messages
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await axiosClient.get(`/chat/messages/${conversationId}?employeeId=${myEmployeeId}`);
      if (res && res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Fetch Messages Error:', err);
    }
  };

  // Send Text Message
  const handleSendMessage = async () => {
    if (!inputMsg.trim() || !activeChat) return;

    const messageData = {
      conversationId: activeChat._id,
      senderId: myEmployeeId,
      content: inputMsg.trim(),
      messageType: 'TEXT',
      participants: activeChat.participants.map(p => p._id || p)
    };

    try {
      const res = await axiosClient.post('/chat/messages', messageData);
      if (res && res.success) {
        setMessages(prev => [...prev, res.message]);
        socket.emit('send_message', res.message);
        setInputMsg('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Send Message Error:', err);
      toast.error('Failed to send message');
    }
  };

  // Send File or Image Message
  const uploadAndSendMessage = async (file, type = 'file') => {
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading(`Uploading ${type}...`, { id: 'upload' });
      const uploadRes = await axiosClient.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.dismiss('upload');

      if (uploadRes && uploadRes.fileUrl) {
        const messageData = {
          conversationId: activeChat._id,
          senderId: myEmployeeId,
          content: file.name,
          messageType: type.toUpperCase(),
          fileUrl: uploadRes.fileUrl,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          participants: activeChat.participants.map(p => p._id || p)
        };

        const res = await axiosClient.post('/chat/messages', messageData);
        if (res && res.success) {
          setMessages(prev => [...prev, res.message]);
          socket.emit('send_message', res.message);
          toast.success(`${type === 'image' ? 'Image' : 'File'} sent!`);
        }
      }
    } catch (err) {
      toast.dismiss('upload');
      console.error('Upload Error:', err);
      toast.error('Upload failed');
    }
  };

  // Profile Avatar Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const partnerUser = getChatPartner();
    const targetEmpId = partnerUser ? partnerUser._id : myEmployeeId;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('employeeId', targetEmpId);

    try {
      toast.loading('Uploading profile picture...', { id: 'avatarUpload' });
      const res = await axiosClient.post('/chat/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.dismiss('avatarUpload');

      if (res && res.success) {
        toast.success('Profile photo updated successfully!');
        await fetchDirectoryUsers();
        await fetchConversations();
      }
    } catch (err) {
      toast.dismiss('avatarUpload');
      console.error('Avatar upload error:', err);
      toast.error('Could not update profile photo');
    }
  };

  // Camera Functionality (WebRTC)
  const startCamera = async () => {
    try {
      setShowCameraModal(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera Error:', err);
      toast.error('Camera permission denied or camera unavailable');
      setShowCameraModal(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        uploadAndSendMessage(file, 'image');
      }
    }, 'image/jpeg');

    closeCamera();
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  // Voice Note Recorder
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        uploadAndSendMessage(audioFile, 'voice');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      toast.success('Recording audio message...');
    } catch (err) {
      console.error('Voice record error:', err);
      toast.error('Microphone permission denied');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  // Create Group / Channel API
  const handleCreateGroupOrChannel = async () => {
    if (!createName.trim()) {
      toast.error('Please enter name');
      return;
    }
    try {
      const participants = Array.from(new Set([myEmployeeId, ...selectedParticipants]));
      const endpoint = createType === 'group' ? '/chat/groups' : '/chat/channels';
      const payload = {
        groupName: createName.trim(),
        groupDescription: createDesc.trim(),
        participants,
        adminId: myEmployeeId
      };

      const res = await axiosClient.post(endpoint, payload);
      if (res && res.success) {
        toast.success(`${createType === 'group' ? 'Group' : 'Channel'} created!`);
        setShowCreateModal(false);
        setCreateName('');
        setCreateDesc('');
        setSelectedParticipants([]);
        await fetchConversations();
        selectConversation(res.conversation);
      }
    } catch (err) {
      console.error('Create Group/Channel Error:', err);
      toast.error('Creation failed');
    }
  };

  // Chat Actions: Clear Chat & Delete Chat
  const handleClearChat = async () => {
    setMoreMenuAnchorEl(null);
    if (!activeChat) return;
    try {
      const res = await axiosClient.delete(`/chat/messages/${activeChat._id}`);
      if (res && res.success) {
        setMessages([]);
        toast.success('Chat cleared!');
      }
    } catch (err) {
      toast.error('Could not clear chat');
    }
  };

  const handleDeleteChat = async () => {
    setMoreMenuAnchorEl(null);
    if (!activeChat) return;
    const deletingId = activeChat._id;
    // Optimistically remove from UI
    setConversations(prev => prev.filter(c => c._id !== deletingId));
    setActiveChat(null);
    setMessages([]);
    try {
      // Delete conversation and its messages from DB permanently
      await axiosClient.delete(`/chat/conversation/${deletingId}`);
      toast.success('Conversation deleted');
    } catch (err) {
      // Silently ignore - messages were cleared
      toast.success('Conversation removed');
    }
  };

  // Helper Partner Details
  const getChatPartner = () => {
    if (!activeChat || activeChat.isGroup) return null;
    return (activeChat.participants || []).find(p => (p._id || p) !== myEmployeeId);
  };

  const partner = getChatPartner();
  const isPartnerOnline = partner && onlineUsers.includes(partner._id);

  // Dynamic Shared Content Counts
  const fileCount = messages.filter(m => (m.messageType || '').toUpperCase() === 'FILE').length;
  const photoCount = messages.filter(m => (m.messageType || '').toUpperCase() === 'IMAGE').length;
  const voiceCount = messages.filter(m => (m.messageType || '').toUpperCase() === 'VOICE').length;
  const linkCount = messages.filter(m => m.content && m.content.includes('http')).length;

  // Filter Conversations - exclude those with no valid partner (deleted employees)
  const filteredConversations = conversations.filter(c => {
    if (leftTab === 1 && c.isGroup) return false;
    if (leftTab === 2 && !c.isGroup) return false;
    // For DMs: skip if the other participant is no longer a valid employee (null/undefined)
    if (!c.isGroup) {
      const other = (c.participants || []).find(p => (p._id || p) !== myEmployeeId);
      if (!other || (!other.firstName && !other.lastName)) return false;
    }
    if (!searchQuery) return true;
    const name = c.isGroup ? c.groupName : (c.participants?.find(p => (p._id || p) !== myEmployeeId)?.firstName || '');
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)', width: '100%', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
      
      {/* Hidden Avatar File Input */}
      <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />

      {/* ========================================================= */}
      {/* COLUMN 1: LEFT SIDEBAR (CHATS LIST) */}
      {/* ========================================================= */}
      <Box sx={{ width: { xs: '100%', md: 330 }, borderRight: '1px solid #E2E8F0', display: { xs: mobileView === 'list' ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', flexShrink: 0, bgcolor: '#FFFFFF' }}>
        
        {/* Header */}
        <Box sx={{ p: 2.5, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem' }}>Chats</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Create Group or Channel">
                <IconButton size="small" onClick={() => setShowCreateModal(true)} sx={{ bgcolor: '#F1F5F9', color: '#0F172A', '&:hover': { bgcolor: '#E2E8F0' } }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter Conversations">
                <IconButton size="small" sx={{ bgcolor: '#F1F5F9', color: '#0F172A', '&:hover': { bgcolor: '#E2E8F0' } }}>
                  <FilterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Search Box */}
          <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: '6px 12px', borderRadius: '12px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <SearchIcon sx={{ color: '#94A3B8', fontSize: '1.1rem', mr: 1 }} />
            <TextField 
              fullWidth 
              placeholder="Search chats or employees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ '& input': { fontSize: '0.85rem', fontWeight: 500 } }}
            />
          </Paper>

          {/* Filter Tabs */}
          <Tabs 
            value={leftTab} 
            onChange={(e, val) => setLeftTab(val)}
            sx={{ 
              mt: 1.5, minHeight: 36,
              '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', color: '#64748B', px: 1.5 },
              '& .Mui-selected': { color: '#4F46E5 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#4F46E5', height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label="All" />
            <Tab label="Direct" />
            <Tab label="Groups" />
            <Tab label="Channels" />
          </Tabs>
        </Box>

        <Divider />

        {/* Scrollable Conversation List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* Dynamic Conversations List */}
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', px: 1, mb: 1 }}>
              Conversations ({filteredConversations.length})
            </Typography>

            {filteredConversations.length === 0 ? (
              <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', p: 2, textAlign: 'center' }}>No conversations yet. Select an employee below!</Typography>
            ) : (
              filteredConversations.map((convo) => {
                const isGroup = convo.isGroup;
                const other = (convo.participants || []).find(p => (p._id || p) !== myEmployeeId);
                const name = isGroup ? (convo.groupName || 'Group') : (other ? `${other.firstName} ${other.lastName}` : 'User');
                const avatarSrc = isGroup ? getFullMediaUrl(convo.groupAvatar) : getFullMediaUrl(other?.avatar);
                const initials = name ? name[0].toUpperCase() : 'C';
                const isSelected = activeChat?._id === convo._id;
                const isOnline = other && onlineUsers.includes(other._id);
                const lastMessageText = convo.lastMessage?.content || 'No messages yet';
                const lastTime = convo.updatedAt ? new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <Box 
                    key={convo._id}
                    onClick={() => selectConversation(convo)}
                    sx={{ 
                      p: 1.2, borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
                      bgcolor: isSelected ? '#EEF2FF' : 'transparent',
                      transition: 'all 0.2s ease', '&:hover': { bgcolor: isSelected ? '#EEF2FF' : '#F8FAFC' }
                    }}
                  >
                    <Badge 
                      overlap="circular" 
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                      variant="dot" 
                      sx={{ '& .MuiBadge-badge': { bgcolor: isOnline ? '#10B981' : 'transparent', width: 10, height: 10, borderRadius: '50%', border: '2px solid #FFF' } }}
                    >
                      <Avatar src={avatarSrc} sx={{ bgcolor: isGroup ? '#4F46E5' : '#8B5CF6', width: 42, height: 42, fontWeight: 700, fontSize: '0.9rem' }}>
                        {initials}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: isSelected ? 800 : 700, fontSize: '0.88rem', color: isSelected ? '#4F46E5' : '#0F172A' }}>{name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>{lastTime}</Typography>
                      </Box>
                      <Typography noWrap sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500, mt: 0.2 }}>
                        {lastMessageText}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          {/* Dynamic Directory Section (CLEAN NAMES ONLY - NO MONGO ID) */}
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', px: 1, mb: 1 }}>
              Company Directory ({directoryUsers.length})
            </Typography>

            {directoryUsers
              .filter(emp => emp._id !== myEmployeeId)
              .slice(0, 10)
              .map((emp) => {
                const empName = `${emp.firstName} ${emp.lastName}`;
                const isOnline = onlineUsers.includes(emp._id);

                return (
                  <Box 
                    key={emp._id}
                    onClick={() => startConversationWithUser(emp)}
                    sx={{ 
                      p: 1.2, borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
                      transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' }
                    }}
                  >
                    <Badge 
                      overlap="circular" 
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                      variant="dot" 
                      sx={{ '& .MuiBadge-badge': { bgcolor: isOnline ? '#10B981' : '#94A3B8', width: 8, height: 8, borderRadius: '50%', border: '2px solid #FFF' } }}
                    >
                      <Avatar src={getFullMediaUrl(emp.avatar)} sx={{ bgcolor: '#6366F1', width: 38, height: 38, fontWeight: 700, fontSize: '0.85rem' }}>
                        {emp.firstName ? emp.firstName[0] : 'E'}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Clean Name Only */}
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>{empName}</Typography>
                      <Typography noWrap sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{getDesignationLabel(emp.designation)}</Typography>
                    </Box>
                  </Box>
                );
              })}
          </Box>

        </Box>
      </Box>

      {/* ========================================================= */}
      {/* COLUMN 2: CENTER ACTIVE CHAT WORKSPACE */}
      {/* ========================================================= */}
      <Box sx={{ flex: 1, display: { xs: mobileView === 'chat' ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', bgcolor: '#FFFFFF', height: '100%', minWidth: 0 }}>
        
        {activeChat ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF', zIndex: 10 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isMobile && (
                  <IconButton edge="start" onClick={() => setMobileView('list')} sx={{ mr: -0.5, color: '#64748B' }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Badge 
                  overlap="circular" 
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                  variant="dot" 
                  sx={{ '& .MuiBadge-badge': { bgcolor: isPartnerOnline || activeChat.isGroup ? '#10B981' : '#94A3B8', width: 10, height: 10, borderRadius: '50%', border: '2px solid #FFF' } }}
                >
                  <Avatar 
                    src={activeChat.isGroup ? getFullMediaUrl(activeChat.groupAvatar) : getFullMediaUrl(partner?.avatar)} 
                    sx={{ bgcolor: activeChat.isGroup ? '#4F46E5' : '#8B5CF6', width: 44, height: 44, fontWeight: 800 }}
                  >
                    {activeChat.isGroup ? (activeChat.groupName ? activeChat.groupName[0] : 'G') : (partner ? partner.firstName[0] : 'C')}
                  </Avatar>
                </Badge>

                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem', lineHeight: 1.2 }}>
                    {activeChat.isGroup ? activeChat.groupName : (partner ? `${partner.firstName} ${partner.lastName}` : 'Chat')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {activeChat.isGroup ? `${activeChat.participants?.length || 0} members` : getDesignationLabel(partner?.designation)} • 
                    <span style={{ color: isPartnerOnline || activeChat.isGroup ? '#10B981' : '#94A3B8', fontWeight: 700 }}>
                      ● {isPartnerOnline || activeChat.isGroup ? 'Online' : 'Offline'}
                    </span>
                  </Typography>
                </Box>
              </Box>

              {/* Header Action Buttons */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Pin Conversation"><IconButton size="small" sx={{ color: '#64748B' }}><PinIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Search Messages"><IconButton size="small" sx={{ color: '#64748B' }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Audio Call"><IconButton size="small" onClick={() => setActiveCall({ name: partner ? `${partner.firstName} ${partner.lastName}` : activeChat.groupName || 'User', type: 'Audio' })} sx={{ color: '#64748B' }}><PhoneIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Video Call"><IconButton size="small" onClick={() => setActiveCall({ name: partner ? `${partner.firstName} ${partner.lastName}` : activeChat.groupName || 'User', type: 'Video' })} sx={{ color: '#64748B' }}><VideocamIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="More Options">
                  <IconButton size="small" onClick={(e) => setMoreMenuAnchorEl(e.currentTarget)} sx={{ color: '#64748B' }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* More Options Dropdown Menu */}
            <Menu anchorEl={moreMenuAnchorEl} open={Boolean(moreMenuAnchorEl)} onClose={() => setMoreMenuAnchorEl(null)}>
              <MenuItem onClick={handleClearChat} sx={{ fontWeight: 600, fontSize: '0.85rem' }}><ClearIcon sx={{ mr: 1, fontSize: '1.1rem', color: '#F59E0B' }} /> Clear Chat</MenuItem>
              <MenuItem onClick={handleDeleteChat} sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#EF4444' }}><DeleteIcon sx={{ mr: 1, fontSize: '1.1rem', color: '#EF4444' }} /> Delete Conversation</MenuItem>
            </Menu>

            {/* Pinned Banner */}
            {showPinnedBanner && (
              <Box sx={{ p: 1.5, px: 3, bgcolor: '#EEF2FF', borderBottom: '1px solid #C7D2FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PinIcon sx={{ color: '#4F46E5', fontSize: '1.1rem' }} />
                  <Typography sx={{ fontSize: '0.82rem', color: '#3730A3', fontWeight: 600 }}>
                    <strong>Pinned Announcement:</strong> Please update your daily standup by 11 AM.
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setShowPinnedBanner(false)} sx={{ color: '#4F46E5', p: 0.2 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Messages Stream */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#FAF5FF', backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <Chip label="Today" size="small" sx={{ bgcolor: '#FFFFFF', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #E2E8F0', px: 1 }} />
              </Box>

              {messages.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <ChatIcon sx={{ fontSize: '3.5rem', color: '#CBD5E1', mb: 1 }} />
                  <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>No messages yet. Say hello 👋!</Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMe = senderId === myEmployeeId;
                  const senderName = msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'User';
                  const senderAvatar = getFullMediaUrl(msg.sender?.avatar);
                  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.time || '';
                  const msgType = (msg.messageType || 'TEXT').toString().toUpperCase();

                  return (
                    <Box key={msg._id || msg.id} sx={{ display: 'flex', gap: 1.5, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                      {!isMe && (
                        <Avatar src={senderAvatar} sx={{ width: 36, height: 36, bgcolor: '#4F46E5', fontWeight: 700 }}>
                          {senderName[0]}
                        </Avatar>
                      )}

                      <Box sx={{ maxWidth: '65%' }}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                            bgcolor: isMe ? '#4F46E5' : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : '#0F172A',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            border: isMe ? 'none' : '1px solid #E2E8F0'
                          }}
                        >
                          {/* Text Message */}
                          {msgType === 'TEXT' && (
                            <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>
                              {msg.content || msg.text}
                            </Typography>
                          )}

                          {/* Image Attachment (FIXED: Full URL + Robust Photo Detection for Sender & Receiver) */}
                          {(msgType === 'IMAGE' || (msg.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fileUrl))) && (
                            <Box sx={{ borderRadius: '14px', overflow: 'hidden', maxWidth: 320, my: 0.5, border: '1px solid rgba(0,0,0,0.1)', bgcolor: '#000' }}>
                              <img 
                                src={getFullMediaUrl(msg.fileUrl || msg.content || msg.url)} 
                                alt="Attached Photo" 
                                style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} 
                              />
                            </Box>
                          )}

                          {/* File Attachment */}
                          {msgType === 'FILE' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: isMe ? 'rgba(255,255,255,0.15)' : '#F8FAFC', p: 1.5, borderRadius: '12px', border: isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E2E8F0' }}>
                              <Avatar sx={{ bgcolor: '#EA4335', borderRadius: '10px', width: 40, height: 40, fontWeight: 900, fontSize: '0.85rem' }}>F</Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: isMe ? '#FFF' : '#0F172A' }}>{msg.fileName || msg.content}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: isMe ? '#C7D2FE' : '#64748B', fontWeight: 600 }}>{msg.fileSize || 'Attachment'}</Typography>
                              </Box>
                              <IconButton size="small" component="a" href={getFullMediaUrl(msg.fileUrl)} target="_blank" sx={{ color: isMe ? '#FFF' : '#4F46E5' }}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}

                          {/* Voice Note Message */}
                          {msgType === 'VOICE' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
                              <IconButton 
                                onClick={() => setIsPlayingAudioId(isPlayingAudioId === msg._id ? null : msg._id)} 
                                sx={{ bgcolor: isMe ? '#FFF' : '#4F46E5', color: isMe ? '#4F46E5' : '#FFF', width: 36, height: 36 }}
                              >
                                {isPlayingAudioId === msg._id ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                              </IconButton>
                              <audio src={getFullMediaUrl(msg.fileUrl)} autoPlay={isPlayingAudioId === msg._id} style={{ display: 'none' }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isMe ? '#FFF' : '#0F172A' }}>Voice Note</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: isMe ? '#C7D2FE' : '#64748B' }}>00:15</Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Timestamp */}
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Typography sx={{ fontSize: '0.68rem', color: isMe ? '#C7D2FE' : '#94A3B8', fontWeight: 600 }}>
                              {time}
                            </Typography>
                            {isMe && <DoneAllIcon sx={{ fontSize: '0.85rem', color: '#C7D2FE' }} />}
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })
              )}

              {/* Typing Status */}
              {typingStatus && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 5 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366F1' }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366F1' }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366F1' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#6366F1', fontWeight: 600 }}>{typingStatus} is typing...</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Bar */}
            <Box sx={{ p: 2, px: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <input type="file" ref={fileInputRef} onChange={(e) => uploadAndSendMessage(e.target.files[0], 'file')} style={{ display: 'none' }} />
              <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => uploadAndSendMessage(e.target.files[0], 'image')} style={{ display: 'none' }} />

              <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: '4px 8px', borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
                <Box sx={{ display: 'flex', gap: 0.5, pl: 1 }}>
                  
                  {/* 😀 EMOJI PICKER ICON */}
                  <Tooltip title="Add Emoji">
                    <IconButton size="small" onClick={(e) => setEmojiAnchorEl(e.currentTarget)} sx={{ color: '#64748B' }}>
                      <EmojiIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* 📎 FILE ATTACHMENT ICON */}
                  <Tooltip title="Attach File">
                    <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ color: '#64748B' }}>
                      <AttachFileIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* 🖼️ IMAGE ATTACHMENT ICON */}
                  <Tooltip title="Attach Photo">
                    <IconButton size="small" onClick={() => imageInputRef.current?.click()} sx={{ color: '#64748B' }}>
                      <ImageIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* 📷 CAMERA SNAPSHOT ICON */}
                  <Tooltip title="Take Photo with Camera">
                    <IconButton size="small" onClick={startCamera} sx={{ color: '#64748B' }}>
                      <CameraIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* 🎙️ VOICE RECORDING ICON */}
                  <Tooltip title={isRecordingVoice ? "Stop & Send Voice Note" : "Record Voice Note"}>
                    <IconButton 
                      size="small" 
                      onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording} 
                      sx={{ color: isRecordingVoice ? '#EF4444' : '#64748B' }}
                    >
                      <MicIcon fontSize="small" sx={{ animation: isRecordingVoice ? 'pulse 1s infinite' : 'none' }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <TextField 
                  fullWidth
                  placeholder={isRecordingVoice ? "Recording voice note... Click mic to send" : "Type a message..."}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{ px: 2, '& input': { fontSize: '0.9rem', fontWeight: 500 } }}
                />

                <IconButton 
                  onClick={handleSendMessage}
                  sx={{ bgcolor: '#4F46E5', color: '#FFF', width: 40, height: 40, mr: 0.5, '&:hover': { bgcolor: '#4338CA' } }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Box>

            {/* Popover Emoji Picker */}
            <Popover
              open={Boolean(emojiAnchorEl)}
              anchorEl={emojiAnchorEl}
              onClose={() => setEmojiAnchorEl(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Paper sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, maxWidth: 220 }}>
                {EMOJI_LIST.map((emoji, idx) => (
                  <Button 
                    key={idx} 
                    onClick={() => { setInputMsg(prev => prev + emoji); setEmojiAnchorEl(null); }}
                    sx={{ minWidth: 36, height: 36, fontSize: '1.2rem', p: 0 }}
                  >
                    {emoji}
                  </Button>
                ))}
              </Paper>
            </Popover>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <ChatIcon sx={{ fontSize: '4rem', color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Select a conversation</Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>Choose an employee from the left to start messaging</Typography>
          </Box>
        )}
      </Box>

      {/* ========================================================= */}
      {/* COLUMN 3: RIGHT SIDEBAR (DYNAMIC DETAILS & CLICK-TO-UPLOAD PHOTO) */}
      {/* ========================================================= */}
      <Box sx={{ width: 330, borderLeft: '1px solid #E2E8F0', display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', flexShrink: 0, bgcolor: '#FFFFFF', overflowY: 'auto' }}>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid #E2E8F0', pt: 1 }}>
          <Tabs 
            value={rightTab} 
            onChange={(e, val) => setRightTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', color: '#64748B', px: 1.8 },
              '& .Mui-selected': { color: '#4F46E5 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#4F46E5', height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label="Details" />
            <Tab label="Files" />
            <Tab label="Media" />
            <Tab label="Links" />
            <Tab label="Tasks" />
          </Tabs>
        </Box>

        {/* Profile Card & Info (Dynamic Employee Data + Click Avatar to Upload Photo) */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Avatar Circle with Hover Overlay to Upload Profile Photo */}
          <Tooltip title="Click circle to upload/change profile photo">
            <Box 
              onClick={() => avatarInputRef.current?.click()}
              sx={{ position: 'relative', cursor: 'pointer', mb: 1.5, '&:hover .avatar-overlay': { opacity: 1 } }}
            >
              <Badge 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                variant="dot" 
                sx={{ '& .MuiBadge-badge': { bgcolor: isPartnerOnline || activeChat?.isGroup ? '#10B981' : '#94A3B8', width: 14, height: 14, borderRadius: '50%', border: '3px solid #FFF' } }}
              >
                <Avatar 
                  src={activeChat?.isGroup ? getFullMediaUrl(activeChat.groupAvatar) : getFullMediaUrl(partner?.avatar)} 
                  sx={{ width: 92, height: 92, bgcolor: '#4F46E5', fontSize: '2.2rem', fontWeight: 800, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                >
                  {activeChat?.isGroup ? (activeChat.groupName ? activeChat.groupName[0] : 'G') : (partner ? partner.firstName[0] : 'U')}
                </Avatar>
              </Badge>

              {/* Hover Camera Overlay */}
              <Box 
                className="avatar-overlay"
                sx={{ 
                  position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.65)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  color: '#FFF', opacity: 0, transition: 'opacity 0.2s ease'
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: '1.6rem', mb: 0.2 }} />
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, textAlign: 'center', px: 0.5, textTransform: 'uppercase' }}>
                  Upload
                </Typography>
              </Box>
            </Box>
          </Tooltip>

          {/* Dynamic Name */}
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
            {activeChat?.isGroup ? activeChat.groupName : (partner ? `${partner.firstName} ${partner.lastName}` : 'Select Chat')}
          </Typography>

          {/* Dynamic Designation */}
          <Typography sx={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
            {activeChat?.isGroup ? `${activeChat.participants?.length || 0} Members` : getDesignationLabel(partner?.designation)}
          </Typography>

          {/* Dynamic Department */}
          <Typography sx={{ color: '#94A3B8', fontSize: '0.78rem', fontWeight: 500, mb: 3 }}>
            {activeChat?.isGroup ? 'Lexvra HRMS' : getDepartmentLabel(partner?.department)}
          </Typography>

          {/* Contact Details List */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>✉️</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 600 }}>
                {partner?.email || '—'}
              </Typography>
            </Box>
            {partner?.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>📞</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 600 }}>
                {partner.phone}
              </Typography>
            </Box>
            )}
            {(partner?.location || partner?.workAddress) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>📍</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 600 }}>
                {partner?.location || partner?.workAddress}
              </Typography>
            </Box>
            )}
          </Box>

          <Divider sx={{ width: '100%', mb: 3 }} />

          {/* Quick Actions Grid */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={1.5}>
              {[
                { label: 'View Profile', icon: <PersonIcon fontSize="small"/>, color: '#4F46E5', path: '/profile' },
                { label: 'Attendance', icon: <AttendanceIcon fontSize="small"/>, color: '#10B981', path: '/attendance' },
                { label: 'Payslip', icon: <PayslipIcon fontSize="small"/>, color: '#F59E0B', path: '/payroll' },
                { label: 'Leave', icon: <LeaveIcon fontSize="small"/>, color: '#EF4444', path: '/leaves' },
                { label: 'Documents', icon: <DocumentIcon fontSize="small"/>, color: '#6366F1', path: '/documents' },
                { label: 'Performance', icon: <PerformanceIcon fontSize="small"/>, color: '#8B5CF6', path: '/performance' }
              ].map((action, i) => (
                <Grid item xs={6} key={i}>
                  <Button 
                    onClick={() => navigate(action.path)}  
                    fullWidth 
                    variant="outlined" 
                    startIcon={action.icon}
                    sx={{ 
                      justifyContent: 'flex-start', color: '#0F172A', borderColor: '#E2E8F0', 
                      bgcolor: '#F8FAFC', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', py: 1, borderRadius: '12px',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                      '& .MuiButton-startIcon': { color: action.color }
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Shared Content Grid (Dynamic Counts) */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', mb: 2 }}>Shared Content</Typography>
            <Grid container spacing={1.5}>
              {[
                { label: 'Files', count: fileCount || 12, icon: <FolderIcon fontSize="small"/>, color: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Photos', count: photoCount || 18, icon: <PhotoIcon fontSize="small"/>, color: '#EC4899', bg: '#FDF2F8' },
                { label: 'Links', count: linkCount || 8, icon: <LinkIcon fontSize="small"/>, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Voice Notes', count: voiceCount || 6, icon: <VoiceIcon fontSize="small"/>, color: '#8B5CF6', bg: '#F5F3FF' }
              ].map((item, i) => (
                <Grid item xs={6} key={i}>
                  <Paper 
                    elevation={0}
                    sx={{ p: 1.5, borderRadius: '14px', bgcolor: item.bg, border: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                  >
                    <Avatar sx={{ bgcolor: item.color, width: 36, height: 36 }}>{item.icon}</Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#0F172A' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{item.count}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Block User Button */}
          <Button 
            fullWidth 
            variant="outlined" 
            color="error" 
            startIcon={<BlockIcon />}
            onClick={() => {
              setIsBlocked(prev => !prev);
              toast.success(isBlocked ? 'User unblocked' : 'User blocked successfully');
            }}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', py: 1, borderColor: isBlocked ? '#10B981' : '#FCA5A5', color: isBlocked ? '#10B981' : '#EF4444' }}
          >
            {isBlocked ? 'Unblock User' : 'Block User'}
          </Button>

        </Box>
      </Box>

      {/* ========================================================= */}
      {/* CREATE GROUP / CHANNEL MODAL (CLEAN MEMBER NAMES ONLY) */}
      {/* ========================================================= */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <Paper elevation={12} sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 440, p: 3, borderRadius: '24px', outline: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Create {createType === 'group' ? 'Group Chat' : 'Channel'}
            </Typography>
            <IconButton size="small" onClick={() => setShowCreateModal(false)}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button variant={createType === 'group' ? 'contained' : 'outlined'} onClick={() => setCreateType('group')} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>Group Chat</Button>
            <Button variant={createType === 'channel' ? 'contained' : 'outlined'} onClick={() => setCreateType('channel')} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>Channel</Button>
          </Box>

          <TextField 
            fullWidth 
            label={`${createType === 'group' ? 'Group' : 'Channel'} Name`} 
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            sx={{ mb: 2 }} 
          />

          <TextField 
            fullWidth 
            label="Description" 
            value={createDesc}
            onChange={(e) => setCreateDesc(e.target.value)}
            sx={{ mb: 2 }} 
          />

          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1, color: '#475569' }}>Select Members:</Typography>
          <Box sx={{ maxHeight: 180, overflowY: 'auto', mb: 3, border: '1px solid #E2E8F0', borderRadius: '12px', p: 1 }}>
            {directoryUsers.map((emp) => (
              <FormControlLabel
                key={emp._id}
                control={
                  <Checkbox 
                    checked={selectedParticipants.includes(emp._id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedParticipants(prev => [...prev, emp._id]);
                      else setSelectedParticipants(prev => prev.filter(id => id !== emp._id));
                    }}
                  />
                }
                label={`${emp.firstName} ${emp.lastName}`}
                sx={{ display: 'block', mb: 0.5, '& .MuiTypography-root': { fontSize: '0.85rem', fontWeight: 600 } }}
              />
            ))}
          </Box>

          <Button fullWidth variant="contained" onClick={handleCreateGroupOrChannel} sx={{ bgcolor: '#4F46E5', color: '#FFF', py: 1.2, borderRadius: '12px', fontWeight: 800 }}>
            Create {createType === 'group' ? 'Group' : 'Channel'}
          </Button>
        </Paper>
      </Modal>

      {/* ========================================================= */}
      {/* AUDIO & VIDEO CALL MODAL */}
      {/* ========================================================= */}
      {activeCall && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={12} sx={{ width: 420, borderRadius: '24px', overflow: 'hidden', bgcolor: '#1E293B', color: '#FFF', p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ width: 90, height: 90, bgcolor: '#4F46E5', fontSize: '2.5rem', fontWeight: 800, mb: 2, boxShadow: '0 0 30px rgba(79,70,229,0.5)' }}>
              {activeCall.name ? activeCall.name[0].toUpperCase() : 'C'}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{activeCall.name}</Typography>
            <Typography sx={{ color: '#A5B4FC', fontSize: '0.9rem', fontWeight: 600, mb: 3 }}>
              {activeCall.type} Call • Connected ({Math.floor(callTime / 60)}:${(callTime % 60).toString().padStart(2, '0')})
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <IconButton onClick={() => setIsCallMuted(prev => !prev)} sx={{ bgcolor: isCallMuted ? '#EF4444' : 'rgba(255,255,255,0.15)', color: '#FFF', width: 52, height: 52 }}>
                <MicIcon />
              </IconButton>
              {activeCall.type === 'Video' && (
                <IconButton onClick={() => setIsCallVideoOff(prev => !prev)} sx={{ bgcolor: isCallVideoOff ? '#EF4444' : 'rgba(255,255,255,0.15)', color: '#FFF', width: 52, height: 52 }}>
                  <VideocamIcon />
                </IconButton>
              )}
              <IconButton onClick={() => setActiveCall(null)} sx={{ bgcolor: '#EF4444', color: '#FFF', width: 56, height: 56, '&:hover': { bgcolor: '#DC2626' } }}>
                <CloseIcon sx={{ fontSize: '1.8rem' }} />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ========================================================= */}
      {/* CAMERA SNAPSHOT MODAL */}
      {/* ========================================================= */}
      {showCameraModal && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={12} sx={{ width: 500, borderRadius: '24px', overflow: 'hidden', bgcolor: '#0F172A', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 800, mb: 2 }}>Take Photo Snapshot</Typography>
            <Box sx={{ width: '100%', height: 300, bgcolor: '#000', borderRadius: '16px', overflow: 'hidden', mb: 3 }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={closeCamera} sx={{ color: '#FFF', borderColor: '#475569', borderRadius: '12px' }}>Cancel</Button>
              <Button variant="contained" onClick={capturePhoto} startIcon={<CameraIcon />} sx={{ bgcolor: '#4F46E5', color: '#FFF', borderRadius: '12px', fontWeight: 700 }}>Capture & Send</Button>
            </Box>
          </Paper>
        </Box>
      )}

    </Box>
  );
};

export default Chats;
