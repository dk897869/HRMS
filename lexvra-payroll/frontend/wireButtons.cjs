const fs = require('fs');
let content = fs.readFileSync('src/pages/Chats/Chats.jsx', 'utf8');

// 1. Import useNavigate
if (!content.includes('useNavigate')) {
  content = content.replace(
    `import { useSelector } from 'react-redux';`,
    `import { useSelector } from 'react-redux';\nimport { useNavigate } from 'react-router-dom';`
  );
}

// 2. Initialize navigate inside component
if (!content.includes('const navigate = useNavigate();')) {
  content = content.replace(
    `const user = useSelector((state) => state.auth.user);`,
    `const user = useSelector((state) => state.auth.user);\n  const navigate = useNavigate();`
  );
}

// 3. Add onClick to AI Prompts
const aiPromptRegex = /\{MOCK_AI_PROMPTS\.map\(\(prompt, i\) => \([\s\S]*?<Button([^>]*)>\s*\{prompt\.label\}\s*<\/Button>\s*\)\)/;
content = content.replace(aiPromptRegex, (match, p1) => {
  if (p1.includes('onClick')) return match;
  return match.replace(/<Button/, '<Button onClick={() => { toast.success("AI processing: " + prompt.label); setAiInput(prompt.label); }}');
});

// 4. Update Quick Actions to include paths and onClick
const updatedQuickActions = `[
                { label: 'Apply Leave', icon: <CalendarIcon fontSize="small"/>, color: '#10B981', path: '/leave' },
                { label: 'View Leaves', icon: <DocumentIcon fontSize="small"/>, color: '#3B82F6', path: '/leave' },
                { label: 'Attendance', icon: <HistoryIcon fontSize="small"/>, color: '#3B82F6', path: '/attendance' },
                { label: 'Payslip', icon: <DocumentIcon fontSize="small"/>, color: '#F59E0B', path: '/payroll' },
                { label: 'Raise Ticket', icon: <TicketIcon fontSize="small"/>, color: '#EF4444', path: '/support' },
                { label: 'Request Asset', icon: <GroupIcon fontSize="small"/>, color: '#6366F1', path: '/assets' }
              ].map((action, i) => (
                <Grid item xs={6} key={i}>
                  <Button onClick={() => navigate(action.path)} `;
                  
content = content.replace(/\[\s*\{\s*label:\s*'Apply Leave'[\s\S]*?\]\.map\(\(action, i\) => \([\s\S]*?<Button([^>]*)>/, updatedQuickActions + '$1>');

fs.writeFileSync('src/pages/Chats/Chats.jsx', content);
