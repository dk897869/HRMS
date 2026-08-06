const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// Fix chatName and chatAvatarInitials in Recent Section
content = content.replace(
  `const chatName = isGroup ? chat.groupName : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');\n            const chatAvatarSrc = isGroup ? chat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);\n            const chatAvatarInitials = isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase();`,
  `const chatName = isGroup ? (chat.groupName || 'Group') : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');\n            const chatAvatarSrc = isGroup ? chat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);\n            const chatAvatarInitials = chatName ? (isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase()) : 'U';`
);

// Fix chatName and chatAvatarInitials in Header Section
content = content.replace(
  `const chatName = isGroup ? activeChat.groupName : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');\n            const chatAvatarSrc = isGroup ? activeChat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);\n            const chatAvatarInitials = isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase();`,
  `const chatName = isGroup ? (activeChat.groupName || 'Group') : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : 'Unknown User');\n            const chatAvatarSrc = isGroup ? activeChat.groupAvatar : (otherParticipant?.avatar ? \`http://localhost:5000\${otherParticipant.avatar}\` : null);\n            const chatAvatarInitials = chatName ? (isGroup ? chatName.substring(0, 2).toUpperCase() : chatName.substring(0, 1).toUpperCase()) : 'U';`
);

// Fix senderInitials in Messages Section
content = content.replace(
  `const senderInitials = senderName.substring(0, 1).toUpperCase();`,
  `const senderInitials = senderName ? senderName.substring(0, 1).toUpperCase() : 'U';`
);

// Another potential issue: chat.participants might be missing if populated incorrectly. Add a fallback.
content = content.replace(
  `const otherParticipant = chat.participants.find(p => p._id !== myEmployeeId);`,
  `const otherParticipant = (chat.participants || []).find(p => p._id !== myEmployeeId);`
);

content = content.replace(
  `const otherParticipant = activeChat.participants.find(p => p._id !== myEmployeeId);`,
  `const otherParticipant = (activeChat.participants || []).find(p => p._id !== myEmployeeId);`
);

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
