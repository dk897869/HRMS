const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// 1. Add handleAskAI logic
const handleAskAIRegex = /const handleStartNewChat[\s\S]*?_id:\s*'new_'\s*\+\s*employee\._id\n\s*\}\);\n\s*\};/m;
content = content.replace(handleAskAIRegex, (match) => {
  return match + `\n
  const handleAskAI = async (prompt) => {
    try {
      const res = await axiosClient.post('/ai/ask', { query: prompt, activeChatId: activeChat && !activeChat.isNew ? activeChat._id : null });
      if (res.data.success) {
        let msg = res.data.text;
        if (res.data.action) {
           msg += \`\\n\\n[Action Required]: Click to \${res.data.action.label} - \${res.data.action.url}\`;
        }
        
        // Add a mock message to the UI to simulate AI response
        const aiMessage = {
          _id: 'ai_' + Date.now(),
          sender: { _id: 'ai', firstName: 'Lexvra', lastName: 'AI Assistant', avatar: null },
          content: msg,
          messageType: 'SYSTEM',
          createdAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        if(messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      toast.error('Failed to get AI response');
    }
  };
  `;
});

// 2. Wire up the AI Prompts
content = content.replace(
  /toast\.success\("AI processing: "\s*\+\s*prompt\.label\);\s*setAiInput\(prompt\.label\);/g,
  `handleAskAI(prompt.label); toast.success("AI is processing your query...");`
);

// 3. Add handlePinMessage
const handleReactToMessageRegex = /const handleReactToMessage[\s\S]*?\}\s*catch\s*\(\w+\)\s*\{\s*toast\.error[\s\S]*?\}\s*\};/m;
content = content.replace(handleReactToMessageRegex, (match) => {
  return match + `\n
  const handlePinMessage = async (msg) => {
    try {
      const isPinned = !msg.isPinned;
      const res = await axiosClient.put(\`/chat/messages/\${msg._id}/pin\`, { isPinned });
      if (res.data.success) {
        toast.success(isPinned ? 'Message pinned' : 'Message unpinned');
        fetchConvos(); // refresh pinned state
      }
    } catch (error) {
      toast.error('Failed to pin message');
    }
  };
  `;
});

// 4. Add Pin button to message actions
const msgActionsRegex = /<Box className="msg-actions"[\s\S]*?<\/Box>/m;
content = content.replace(msgActionsRegex, (match) => {
  return match.replace(
    `</Box>`,
    `  <IconButton size="small" onClick={() => handlePinMessage(msg)} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' }, width: 24, height: 24 }}><PushPinIcon sx={{ fontSize: '0.8rem', color: msg.isPinned ? '#4F46E5' : '#475569' }} /></IconButton>\n</Box>`
  );
});


// 5. Update the Pinned Banner to show dynamically pinned messages
// Currently the banner is:
// <Box sx={{ px: 3, py: 1.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
//   ...
//   <Typography ...>Pinned by Admin</Typography>
//   <Typography ...>Please make sure to update your daily standup here by 11 AM.</Typography>
// </Box>

const pinnedBannerRegex = /\{\/\* Pinned Banner \*\/\}\s*<Box sx=\{\{\s*px:\s*3,\s*py:\s*1\.5,\s*bgcolor:\s*'#F8FAFC'[\s\S]*?<\/IconButton>\s*<\/Box>/m;

content = content.replace(pinnedBannerRegex, `{/* Pinned Banner */}
        {activeChat && activeChat.pinnedMessages && activeChat.pinnedMessages.length > 0 && (
          (() => {
            // Find the full message object for the latest pinned message
            // Wait, we need to populate pinnedMessages or just show the latest from our messages array if it exists.
            const pinnedMsgsInChat = messages.filter(m => m.isPinned);
            if (pinnedMsgsInChat.length > 0) {
              const latestPinned = pinnedMsgsInChat[pinnedMsgsInChat.length - 1];
              return (
                <Box sx={{ px: 3, py: 1.5, bgcolor: '#F5F3FF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PushPinIcon sx={{ color: '#4F46E5', fontSize: '1.1rem' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pinned Message</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{latestPinned.content}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{formatTime(latestPinned.createdAt)}</Typography>
                </Box>
              );
            }
            return null;
          })()
        )}`);

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
