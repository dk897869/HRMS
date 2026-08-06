import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, TextField, IconButton, Avatar, Button, 
  Chip, Paper, Grid, Tooltip, Card, CardContent, Divider 
} from '@mui/material';
import { 
  AutoAwesome as AIIcon, 
  Send as SendIcon, 
  MicNoneOutlined as MicIcon, 
  VolumeUp as VolumeUpIcon, 
  VolumeOff as VolumeOffIcon, 
  History as HistoryIcon, 
  PersonAdd as PersonAddIcon, 
  ReceiptLong as ReceiptIcon, 
  Dashboard as DashboardIcon, 
  EventAvailable as LeaveIcon, 
  Description as DocumentIcon,
  GraphicEq as WaveIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

// Language Prompts Configuration
const PROMPTS_BY_LANGUAGE = {
  pa: [
    { title: '👤 ਕਰਮਚਾਰੀ ਜੋੜੋ (Add Employee)', desc: 'ਨਵਾਂ Employee ਜੋੜਨ ਦਾ Step-by-Step ਤਰੀਕਾ', query: 'Employee add ਕਿਵੇਂ ਕਰੀਏ', icon: <PersonAddIcon sx={{ color: '#6366F1' }} /> },
    { title: '💵 ਤਨਖਾਹ & Payslip', desc: 'ਸੈਲਰੀ ਬਿਓਰਾ ਅਤੇ PDF Payslip ਡਾਊਨਲੋਡ ਕਰੋ', query: 'Salary slip ਕਿਵੇਂ ਡਾਊਨਲੋਡ ਕਰੀਏ', icon: <ReceiptIcon sx={{ color: '#10B981' }} /> },
    { title: '🏛️ ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ ਟ੍ਰੇਨਿੰਗ', desc: 'Admin Dashboard ਮੋਡਿਊਲ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ', query: 'Admin dashboard ਦੀ ਟ੍ਰੇਨਿੰਗ', icon: <DashboardIcon sx={{ color: '#F59E0B' }} /> },
    { title: '🌴 ਛੁੱਟੀ ਦੀ ਅਰਜ਼ੀ (Leave)', desc: 'ਛੁੱਟੀ ਦਾ ਬਕਾਇਆ ਦੇਖੋ ਅਤੇ ਅਪਲਾਈ ਕਰੋ', query: 'Leave apply ਕਰੋ', icon: <LeaveIcon sx={{ color: '#EC4899' }} /> },
    { title: '📄 Experience Letter', desc: 'ਤੁਰੰਤ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਲੈਟਰ ਬਣਾਓ', query: 'Experience letter ਬਣਾਓ', icon: <DocumentIcon sx={{ color: '#8B5CF6' }} /> }
  ],
  hi: [
    { title: '👤 नया Employee जोड़ें', desc: 'Step-by-Step कर्मचारी जोड़ने की पूरी गाइड', query: 'Employee add कैसे करें', icon: <PersonAddIcon sx={{ color: '#6366F1' }} /> },
    { title: '💵 सैलरी और Payslip', desc: 'वेतन ब्रेकडाउन और PDF स्लिप डाउनलोड करें', query: 'Salary slip कैसे डाउनलोड करें', icon: <ReceiptIcon sx={{ color: '#10B981' }} /> },
    { title: '🏛️ एडमिन डैशबोर्ड गाइड', desc: 'Admin Dashboard की पूरी ट्रेनिंग', query: 'Admin dashboard की ट्रेनिंग', icon: <DashboardIcon sx={{ color: '#F59E0B' }} /> },
    { title: '🌴 छुट्टी का आवेदन', desc: 'Leave Balance देखें और तुरंत अप्लाई करें', query: 'Leave apply करें', icon: <LeaveIcon sx={{ color: '#EC4899' }} /> },
    { title: '📄 HR दस्तावेज एवं पत्र', desc: 'Experience और Relieving Letter बनाएं', query: 'Experience letter बनाएं', icon: <DocumentIcon sx={{ color: '#8B5CF6' }} /> }
  ],
  en: [
    { title: '👤 Add New Employee', desc: 'Step-by-step onboarding walkthrough', query: 'How to add employee', icon: <PersonAddIcon sx={{ color: '#6366F1' }} /> },
    { title: '💵 Payslip & Payroll', desc: 'View breakdown & download PDF payslip', query: 'How to download payslip', icon: <ReceiptIcon sx={{ color: '#10B981' }} /> },
    { title: '🏛️ Admin Dashboard Tour', desc: 'Complete module walkthrough & insights', query: 'Admin dashboard training', icon: <DashboardIcon sx={{ color: '#F59E0B' }} /> },
    { title: '🌴 Leave & Attendance', desc: 'Check balances & 1-click leave submission', query: 'Apply leave tomorrow', icon: <LeaveIcon sx={{ color: '#EC4899' }} /> },
    { title: '📄 Experience Letter', desc: 'Generate official stamped PDF letters', query: 'Generate experience letter', icon: <DocumentIcon sx={{ color: '#8B5CF6' }} /> }
  ]
};

const AIAssistantPage = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // Engine States
  const [selectedLanguage, setSelectedLanguage] = useState('pa'); // Default Punjabi as requested
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-pro');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStep, setAiStep] = useState(null);
  const [aiStepData, setAiStepData] = useState({});

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoiceOutput, setAutoVoiceOutput] = useState(true);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Clean Text to Speech (Female for Punjabi & Hindi, Male for English)
  const speakResponse = (textToSpeak, forcedLang) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentLang = forcedLang || selectedLanguage;
    const cleanText = textToSpeak.replace(/[*#•`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    if (currentLang === 'pa' || /[\u0A00-\u0A7F]/.test(cleanText)) {
      // 🌾 PUNJABI (FEMALE VOICE)
      utterance.lang = 'pa-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.25; // Female pitch
      const femalePaVoice = voices.find(v => v.lang.includes('pa') || v.name.toLowerCase().includes('punjabi')) ||
                            voices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && (v.name.includes('Swara') || v.name.includes('Female') || v.name.includes('Google हिन्दी') || v.name.includes('Kalpana') || v.name.includes('Zira'))) ||
                            voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (femalePaVoice) utterance.voice = femalePaVoice;
    } else if (currentLang === 'hi' || /[\u0900-\u097F]/.test(cleanText)) {
      // 🇮🇳 HINDI (FEMALE VOICE)
      utterance.lang = 'hi-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.25; // Female pitch
      const femaleHiVoice = voices.find(v => v.lang.includes('hi') && (v.name.includes('Swara') || v.name.includes('Female') || v.name.includes('Google हिन्दी') || v.name.includes('Kalpana') || v.name.includes('Zira'))) ||
                            voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (femaleHiVoice) utterance.voice = femaleHiVoice;
    } else {
      // 🇬🇧 ENGLISH (MALE VOICE)
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 0.88; // Male pitch
      const maleEnVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Guy') || v.name.includes('Mark') || v.name.includes('George') || v.name.includes('Google US English'))) ||
                          voices.find(v => v.lang.includes('en'));
      if (maleEnVoice) utterance.voice = maleEnVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (Voice Input)
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Please use Google Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'pa' ? 'pa-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast('Listening... Speak now!', { icon: '🎙️' });
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInputQuery(spokenText);
      toast.success(`Heard: "${spokenText}"`);
      handleSendQuery(spokenText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Could not hear voice. Please speak again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Main Query Handler
  const handleSendQuery = async (queryText, overrideStep, overrideStepData) => {
    const textToQuery = (typeof queryText === 'string' && queryText.trim()) ? queryText.trim() : inputQuery.trim();
    const currentStep = overrideStep !== undefined ? overrideStep : aiStep;
    const currentStepData = overrideStepData !== undefined ? overrideStepData : aiStepData;

    if (!textToQuery && !currentStep) return;
    if (loading) return;

    // Append User Message to Thread
    const userMsg = { sender: 'user', text: textToQuery, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/ai/ask', {
        query: textToQuery,
        step: currentStep,
        stepData: currentStepData,
        model: selectedModel,
        language: selectedLanguage
      });

      if (res && res.success) {
        const responseText = res.text || 'Request completed.';
        const aiMsg = {
          sender: 'ai',
          text: responseText,
          action: res.action || null,
          step: res.nextStep || null,
          stepData: res.nextStepData || {},
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistory(prev => [...prev, aiMsg]);
        setAiStep(res.nextStep || null);
        setAiStepData(res.nextStepData || {});

        // Auto Speak Response
        if (autoVoiceOutput) {
          speakResponse(responseText, res.targetLang || selectedLanguage);
        }
      } else {
        toast.error(res?.message || 'Error processing AI query.');
      }
    } catch (err) {
      console.error('AI Error:', err);
      toast.error('Unable to reach AI service.');
    } finally {
      setLoading(false);
    }
  };

  const currentPrompts = PROMPTS_BY_LANGUAGE[selectedLanguage] || PROMPTS_BY_LANGUAGE.pa;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: 'calc(100vh - 70px)', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* ── TOP CONTROL HEADER ────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#4F46E5', width: 44, height: 44, boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)' }}>
            <AIIcon sx={{ color: '#FFF', fontSize: '1.6rem' }} />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem' }}>LX Intelligence</Typography>
              <Chip label="ACTIVE" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#DEF7EC', color: '#03543F' }} />
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
              {selectedLanguage === 'pa' ? 'ਗੁਰਮੁਖੀ ਪੰਜਾਬੀ ਅਤੇ AI ਮੋਡਿਊਲ ਐਕਟਿਵ' : selectedLanguage === 'hi' ? 'हिंदी भाषा और AI मॉडल एक्टिव' : 'Enterprise Neural Suite Active'}
            </Typography>
          </Box>
        </Box>

        {/* Controls: Language, Model, Speech Toggle, Reset */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          
          {/* Language Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F1F5F9', p: '4px 10px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Language:</Typography>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.82rem', color: '#4F46E5', outline: 'none', cursor: 'pointer' }}
            >
              <option value="pa">🌾 ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="hi">🇮🇳 हिंदी (Hindi)</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </Box>

          {/* Model Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F1F5F9', p: '4px 10px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Model:</Typography>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', outline: 'none', cursor: 'pointer' }}
            >
              <option value="gemini-3.5-pro">⚡ Gemini 3.5 Pro (Recommended)</option>
              <option value="gemini-3.5-flash">🚀 Gemini 3.5 Flash (Fast)</option>
              <option value="gemini-3.1-ultra">🧠 Gemini 3.1 Ultra (Analytics)</option>
              <option value="lexvra-4.0">✨ Lexvra Neural 4.0</option>
            </select>
          </Box>

          {/* Voice Output Toggle */}
          <Tooltip title={autoVoiceOutput ? `Voice Active (${selectedLanguage === 'en' ? 'Male Voice' : 'Female Voice'})` : "Voice Output Muted"}>
            <IconButton 
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setAutoVoiceOutput(prev => !prev);
              }} 
              sx={{ bgcolor: autoVoiceOutput ? '#EEF2FF' : '#F1F5F9', color: autoVoiceOutput ? '#4F46E5' : '#64748B', borderRadius: '12px' }}
            >
              {autoVoiceOutput ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Reset Session Button */}
          <Tooltip title="Reset AI Workspace">
            <IconButton onClick={() => { setChatHistory([]); setAiStep(null); setAiStepData({}); }} sx={{ bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '12px' }}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* ── CHAT THREAD / HERO CONTENT ────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 450 }}>
        {chatHistory.length === 0 ? (
          /* HERO PROMPT CARDS (WHEN FRESH SESSION) */
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4, textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#4F46E5', mb: 2, boxShadow: '0 0 35px rgba(79, 70, 229, 0.4)' }}>
              <AIIcon sx={{ fontSize: '3rem', color: '#FFF' }} />
            </Avatar>
            
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
              {selectedLanguage === 'pa' 
                ? `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${user?.firstName || ''}! ਮੈਂ LX Intelligence ਹਾਂ।`
                : selectedLanguage === 'hi'
                ? `नमस्ते ${user?.firstName || ''}! मैं LX Intelligence हूँ।`
                : `Welcome ${user?.firstName || ''} to LX Intelligence!`}
            </Typography>

            <Typography sx={{ color: '#64748B', fontSize: '0.95rem', maxWidth: 600, mb: 4, fontWeight: 500 }}>
              {selectedLanguage === 'pa'
                ? 'ਕਿਸੇ ਵੀ HRMS ਮੋਡਿਊਲ ਬਾਰੇ ਜਾਣਕਾਰੀ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਕਾਰਡਾਂ \'ਤੇ ਕਲਿੱਕ ਕਰੋ ਜਾਂ ਸਿੱਧਾ ਪੁੱਛੋ:'
                : selectedLanguage === 'hi'
                ? 'किसी भी HRMS मॉड्यूल के बारे में जानने के लिए नीचे दिए गए कार्ड्स पर क्लिक करें या सीधे पूछें:'
                : 'Click any card below for step-by-step module training or type any custom query:'}
            </Typography>

            <Grid container spacing={2.5} sx={{ maxWidth: 950 }}>
              {currentPrompts.map((card, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card 
                    elevation={0}
                    onClick={() => handleSendQuery(card.query)}
                    sx={{ 
                      p: 1.5, borderRadius: '18px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.25s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 25px rgba(79, 70, 229, 0.12)', borderColor: '#6366F1' }
                    }}
                  >
                    <CardContent sx={{ p: '12px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#F8FAFC' }}>{card.icon}</Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>{card.title}</Typography>
                      </Box>
                      <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.4 }}>{card.desc}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          /* STREAMING CHAT MESSAGES THREAD */
          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: 'calc(100vh - 280px)' }}>
            {chatHistory.map((msg, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: msg.sender === 'user' ? '#1E293B' : '#4F46E5', width: 40, height: 40, fontWeight: 700, fontSize: '0.9rem' }}>
                  {msg.sender === 'user' ? (user?.firstName ? user.firstName[0].toUpperCase() : 'U') : <AIIcon fontSize="small" />}
                </Avatar>

                <Box sx={{ maxWidth: '80%' }}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: msg.sender === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px', bgcolor: msg.sender === 'user' ? '#4F46E5' : '#F8FAFC', color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A', border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0' }}>
                    
                    {msg.sender === 'ai' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          LX Intelligence
                        </Typography>
                        <IconButton size="small" onClick={() => speakResponse(msg.text)} sx={{ color: isSpeaking ? '#EF4444' : '#4F46E5', p: 0.5 }}>
                          <VolumeUpIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}

                    <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                      {msg.text}
                    </Typography>

                    {/* Action Portal Button */}
                    {msg.action && msg.action.url && (
                      <Button
                        variant="contained"
                        onClick={() => navigate(msg.action.url)}
                        sx={{ mt: 2, bgcolor: msg.sender === 'user' ? '#FFF' : '#4F46E5', color: msg.sender === 'user' ? '#4F46E5' : '#FFF', textTransform: 'none', fontWeight: 700, borderRadius: '10px', width: '100%', '&:hover': { bgcolor: msg.sender === 'user' ? '#F1F5F9' : '#4338CA' } }}
                      >
                        👉 {msg.action.label || 'Open Action Portal'}
                      </Button>
                    )}

                    {/* Interactive Leave Selector Buttons */}
                    {msg.step === 'leave_apply_select_type' && msg.stepData?.leaveTypes && (
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                          {selectedLanguage === 'pa' ? 'ਛੁੱਟੀ ਦੀ ਕਿਸਮ ਚੁਣੋ:' : selectedLanguage === 'hi' ? 'छुट्टी का प्रकार चुनें:' : 'Select Leave Type to proceed:'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {msg.stepData.leaveTypes.map((t) => (
                            <Button
                              key={t.code}
                              size="small"
                              variant="contained"
                              onClick={() => handleSendQuery(t.code, 'leave_apply_select_type', { selectedType: t.name || t.code })}
                              sx={{ bgcolor: '#4F46E5', color: '#FFF', textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              {t.code} ({t.name})
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                  <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.5, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.time}
                  </Typography>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#4F46E5', width: 36, height: 36 }}><AIIcon fontSize="small" /></Avatar>
                <Paper elevation={0} sx={{ p: 1.5, px: 2.5, borderRadius: '16px', bgcolor: '#F1F5F9', color: '#4F46E5' }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>🤖 LX Intelligence is thinking...</Typography>
                </Paper>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Paper>
        )}
      </Box>

      {/* ── BOTTOM DOCK INPUT ────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: '24px', bgcolor: '#FFFFFF', border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
        <Tooltip title={isListening ? "Listening..." : "Speak Query (Voice Search)"}>
          <IconButton onClick={startVoiceInput} sx={{ color: isListening ? '#EF4444' : '#64748B', mr: 1 }}>
            <MicIcon sx={{ animation: isListening ? 'pulse 1s infinite' : 'none' }} />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          variant="standard"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputQuery) {
              if (aiStep === 'leave_apply_get_reason') {
                handleSendQuery(inputQuery, 'leave_apply_get_reason', aiStepData);
              } else {
                handleSendQuery(inputQuery);
              }
            }
          }}
          placeholder={
            isListening 
              ? "Listening to your voice..." 
              : selectedLanguage === 'pa'
              ? "ਕੁਝ ਵੀ ਪੁੱਛੋ ਜਾਂ ਬੋਲੋ (e.g. Employee add ਕਿਵੇਂ ਕਰੀਏ)..."
              : selectedLanguage === 'hi'
              ? "कुछ भी पूछें या बोलें (e.g. Employee add कैसे करें)..."
              : "Ask me anything or speak (e.g. How to add employee)..."
          }
          InputProps={{ disableUnderline: true }}
          sx={{ '& input': { fontSize: '0.95rem', fontWeight: 500 } }}
        />

        <IconButton 
          onClick={() => {
            if (inputQuery) {
              if (aiStep === 'leave_apply_get_reason') {
                handleSendQuery(inputQuery, 'leave_apply_get_reason', aiStepData);
              } else {
                handleSendQuery(inputQuery);
              }
            }
          }} 
          sx={{ bgcolor: '#4F46E5', color: '#FFF', ml: 1, '&:hover': { bgcolor: '#4338CA' } }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Paper>

      {/* Disclaimer */}
      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', fontWeight: 500, mt: -1 }}>
        {selectedLanguage === 'pa'
          ? 'AI ਦੇ ਜਵਾਬ 100% ਸਹੀ ਨਹੀਂ ਹੋ ਸਕਦੇ।'
          : selectedLanguage === 'hi'
          ? 'AI के जवाब 100% सही नहीं हो सकते।'
          : 'AI responses may not be 100% accurate.'}
      </Typography>
    </Box>
  );
};

export default AIAssistantPage;
