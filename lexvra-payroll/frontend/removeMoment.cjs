const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// Remove moment import
content = content.replace(/import moment from 'moment';\n/g, '');

// Replace moment formatting with a helper function
const helper = `
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };
`;

content = content.replace(/  \/\/ Real Data States/g, helper + '  // Real Data States');

// Replace moment calls
content = content.replace(/moment\(chat\.lastMessage\.createdAt\)\.format\('h:mm A'\)/g, 'formatTime(chat.lastMessage.createdAt)');
content = content.replace(/moment\(msg\.createdAt\)\.format\('h:mm A'\)/g, 'formatTime(msg.createdAt)');

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
