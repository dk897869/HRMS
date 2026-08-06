const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// 1. Remove Pinned and Direct Messages Headers
content = content.replace(/<Typography[^>]*>Pinned<\/Typography>/g, '');
content = content.replace(/<Typography[^>]*>Direct Messages<\/Typography>/g, '');
content = content.replace(/\{\/\* Pinned Section \*\/\}/g, '');
content = content.replace(/\{\/\* Direct Messages Section \*\/\}/g, '');

// 2. Remove the MOCK mapping loops
content = content.replace(/\{MOCK_PINNED_CHATS\.map\(\(chat\) => \([\s\S]*?\}\)\)/g, '');
content = content.replace(/\{MOCK_DMS\.map\(\(chat\) => \([\s\S]*?\}\)\)/g, '');

// 3. Fix the AI prompts from mapping MOCK to rendering actual Lexvra logic or keeping mock if requested
// Let's leave MOCK_AI_PROMPTS for now as they are just generic prompts.

// Write back
fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
