const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// Replace Pinned Section with nothing for now (or a dynamic Pinned if we want)
const pinnedRegex = /\{\/\* Pinned Section \*\/\}.*?\{MOCK_PINNED_CHATS\.map\(\(chat\) => \([\s\S]*?\}\)\)/s;
content = content.replace(pinnedRegex, `{/* Pinned Section Removed for Dynamic Flow */}`);

// Replace MOCK_DMS section
const dmsRegex = /\{\/\* Direct Messages Section \*\/\}.*?\{MOCK_DMS\.map\(\(chat\) => \([\s\S]*?\}\)\)/s;
content = content.replace(dmsRegex, `{/* Direct Messages Section Removed for Dynamic Flow */}`);

// Update the Recent section to respect leftTab filter
const recentRegex = /\{\/\* Recent Section \*\/\}.*?\{conversations\.map\(\(chat\) => \{/s;
content = content.replace(recentRegex, `{/* Recent Section */}
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', mt: 3, mb: 1.5, px: 1 }}>{leftTab === 0 ? 'Recent' : leftTab === 1 ? 'Groups' : leftTab === 2 ? 'Direct Messages' : 'Channels'}</Typography>
          {conversations.filter(c => {
             if (leftTab === 0) return true;
             if (leftTab === 1) return c.isGroup && !c.isChannel;
             if (leftTab === 2) return !c.isGroup;
             if (leftTab === 3) return c.isGroup && c.isChannel;
             return true;
          }).map((chat) => {`);

// Dynamic Right Sidebar
const rightSidebarRegex = /\{\/\* Details Content \*\/\}.*?\{\/\* Main Info \*\/\}.*?<Avatar sx=\{\{ width: 80, height: 80, bgcolor: '#4F46E5', fontSize: '2rem', fontWeight: 800, mb: 2 \}\}>IT<\/Avatar>.*?<\/Typography>.*?<\/Box>/s;

content = content.replace(rightSidebarRegex, `{/* Details Content */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Main Info */}
          {(() => {
            if (!activeChat) return <Typography sx={{ color: '#94A3B8' }}>Select a chat to view details</Typography>;
            
            const isGroup = activeChat.isGroup;
            const otherParticipant = activeChat.participants.find(p => p._id !== myEmployeeId);
            const chatName = isGroup ? (activeChat.groupName || 'Group') : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');
            const chatAvatarSrc = isGroup ? activeChat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);
            const chatAvatarInitials = chatName ? (isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase()) : 'U';
            const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id);
            const statusText = isGroup ? \`\${activeChat.participants.length} members\` : (isOnline ? 'Active now' : 'Offline');

            return (
              <>
                <Avatar src={chatAvatarSrc} sx={{ width: 80, height: 80, bgcolor: isGroup ? '#4F46E5' : '#8B5CF6', fontSize: '2rem', fontWeight: 800, mb: 2 }}>{chatAvatarInitials}</Avatar>
                <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem', mb: 0.5 }}>{chatName}</Typography>
                <Typography sx={{ color: isOnline || isGroup ? '#10B981' : '#94A3B8', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isOnline || isGroup ? '#10B981' : '#94A3B8' }} /> {statusText}
                </Typography>
                <Typography sx={{ textAlign: 'center', color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5, mb: 4 }}>
                  {isGroup ? (activeChat.groupDescription || 'Official group communication.') : (otherParticipant?.designation || 'Employee')}
                </Typography>
              </>
            );
          })()}
`);

// Dynamic About Group section in right sidebar
const aboutGroupRegex = /\{\/\* About Group \*\/\}.*?<Box sx=\{\{ display: 'flex', justifyContent: 'space-between' \}\}>\n\s*<Typography sx=\{\{ color: '#64748B', fontSize: '0\.85rem', fontWeight: 500 \}\}>Created by<\/Typography>\n\s*<Typography sx=\{\{ color: '#0F172A', fontSize: '0\.85rem', fontWeight: 700 \}\}>Admin User<\/Typography>\n\s*<\/Box>\n\s*<Box sx=\{\{ display: 'flex', justifyContent: 'space-between' \}\}>\n\s*<Typography sx=\{\{ color: '#64748B', fontSize: '0\.85rem', fontWeight: 500 \}\}>Created on<\/Typography>\n\s*<Typography sx=\{\{ color: '#0F172A', fontSize: '0\.85rem', fontWeight: 700 \}\}>12 Jan 2026<\/Typography>\n\s*<\/Box>\n\s*<Box sx=\{\{ display: 'flex', justifyContent: 'space-between' \}\}>\n\s*<Typography sx=\{\{ color: '#64748B', fontSize: '0\.85rem', fontWeight: 500 \}\}>Department<\/Typography>\n\s*<Typography sx=\{\{ color: '#0F172A', fontSize: '0\.85rem', fontWeight: 700 \}\}>Information Technology<\/Typography>\n\s*<\/Box>/s;

content = content.replace(aboutGroupRegex, `{/* About Group */}
          {activeChat && activeChat.isGroup && (
            <Box sx={{ width: '100%', mb: 4 }}>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', mb: 2 }}>About Group</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>Created by</Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 700 }}>
                    {activeChat.groupAdmin && activeChat.groupAdmin.length > 0 ? \`\${activeChat.groupAdmin[0].firstName} \${activeChat.groupAdmin[0].lastName}\` : 'Admin'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>Created on</Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 700 }}>{formatTime(activeChat.createdAt)}</Typography>
                </Box>
              </Box>
            </Box>
          )}`);


fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
