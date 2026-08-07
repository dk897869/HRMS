import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Button, Paper, Chip, Divider, Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import CancelScheduleSendOutlinedIcon from '@mui/icons-material/CancelScheduleSendOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import StarIcon from '@mui/icons-material/Star';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

const SubscriptionPage = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 18, minutes: 42, seconds: 37 });

  // Mock countdown timer for effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else { hours = 23; if (days > 0) days--; }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  const TimeBox = ({ label, value }) => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#1B254B' }}>{formatNumber(value)}</Typography>
      <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>{label}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F4F7FE', minHeight: '100vh', width: '100%' }}>
      
      {/* Free Trial Banner */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: '#FFFFFF', mb: 5, boxShadow: '0 10px 30px rgba(112, 144, 176, 0.08)', border: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
        
        {/* Left: Info */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#EEF2FF', width: 80, height: 80 }}>
            <StarIcon sx={{ color: '#4318FF', fontSize: '3rem' }} />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1B254B' }}>You are on Free Trial</Typography>
              <Chip label="7 Days Trial" size="small" sx={{ bgcolor: '#EEF2FF', color: '#4318FF', fontWeight: 700, borderRadius: '6px' }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#A3AED0', mb: 3, maxWidth: 400 }}>
              Explore PayFlexPayroll with full access. Choose a plan to continue using all features.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" sx={{ bgcolor: '#4318FF', '&:hover': { bgcolor: '#3311DB' }, textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 3 }}>Manage Subscription</Button>
              <Button variant="outlined" sx={{ color: '#1B254B', borderColor: '#E2E8F0', textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 3 }}>View Usage</Button>
            </Box>
          </Box>
        </Box>

        {/* Center: Timer */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="subtitle2" sx={{ color: '#1B254B', fontWeight: 800, mb: 2 }}>Trial expires in</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TimeBox label="Days" value={timeLeft.days} />
            <Typography variant="h4" sx={{ color: '#1B254B', fontWeight: 800 }}>:</Typography>
            <TimeBox label="Hours" value={timeLeft.hours} />
            <Typography variant="h4" sx={{ color: '#1B254B', fontWeight: 800 }}>:</Typography>
            <TimeBox label="Minutes" value={timeLeft.minutes} />
            <Typography variant="h4" sx={{ color: '#1B254B', fontWeight: 800 }}>:</Typography>
            <TimeBox label="Seconds" value={timeLeft.seconds} />
          </Box>
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress variant="determinate" value={42} sx={{ height: 6, borderRadius: 3, bgcolor: '#F4F7FE', '& .MuiLinearProgress-bar': { bgcolor: '#4318FF' } }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>3 of 7 days used</Typography>
              <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>Ends on 14 Aug 2026</Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: Trial Alerts */}
        <Box sx={{ borderLeft: '1px solid #E2E8F0', pl: 4, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ color: '#1B254B', fontWeight: 800, mb: 3 }}>Trial Alerts</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsActiveOutlinedIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 700 }}>3 days left</Typography>
              </Box>
              <Chip label="11 Aug 2026" size="small" sx={{ bgcolor: 'transparent', color: '#64748B', fontWeight: 600, fontSize: '0.65rem' }} />
              <Chip label="Upcoming" size="small" sx={{ bgcolor: '#FFFBEB', color: '#F59E0B', fontWeight: 700, fontSize: '0.65rem' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsActiveOutlinedIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 700 }}>Last day</Typography>
              </Box>
              <Chip label="14 Aug 2026" size="small" sx={{ bgcolor: 'transparent', color: '#64748B', fontWeight: 600, fontSize: '0.65rem' }} />
              <Chip label="Last Day" size="small" sx={{ bgcolor: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '0.65rem' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsOffOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 700 }}>Trial expired</Typography>
              </Box>
              <Chip label="15 Aug 2026" size="small" sx={{ bgcolor: 'transparent', color: '#64748B', fontWeight: 600, fontSize: '0.65rem' }} />
              <Chip label="Expired" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: '0.65rem' }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Pricing Header */}
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B', mb: 1 }}>Choose the perfect plan for your business</Typography>
        <Typography variant="body1" sx={{ color: '#A3AED0', fontWeight: 500 }}>Simple pricing. Powerful features. No hidden charges.</Typography>
        <Box sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <VerifiedUserOutlinedIcon sx={{ color: '#4318FF' }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1B254B' }}>Secure & Trusted</Typography>
            <Typography variant="caption" sx={{ color: '#A3AED0' }}>Your data is always protected</Typography>
          </Box>
        </Box>
      </Box>

      {/* Pricing Cards */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        
        {/* Plan 1: Monthly ₹249 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4318FF', width: 56, height: 56 }}><PeopleAltOutlinedIcon /></Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B' }}>Monthly Plan</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B' }}>₹249</Typography>
                  <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>/ month</Typography>
                </Box>
              </Box>
            </Box>
            <Chip label="Billed monthly" size="small" sx={{ alignSelf: 'flex-start', mb: 4, bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600 }} />
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {['Up to 20 Employees', 'Basic Payroll', 'Standard Support', 'Core HR Features'].map((feat, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: '#4318FF', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 600 }}>{feat}</Typography>
                </Box>
              ))}
            </Box>
            
            <Button variant="outlined" fullWidth sx={{ py: 1.5, borderRadius: '12px', borderColor: '#E2E8F0', color: '#4318FF', fontWeight: 800, textTransform: 'none' }}>Get Started</Button>
          </Paper>
        </Grid>

        {/* Plan 2: Yearly ₹3999 (Best Value) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ position: 'relative', p: 4, borderRadius: '24px', border: '2px solid #10B981', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Chip icon={<StarIcon sx={{ fontSize: '14px !important' }}/>} label="Best Value" sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', bgcolor: '#10B981', color: '#fff', fontWeight: 800 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 56, height: 56 }}><CalendarMonthOutlinedIcon /></Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B' }}>Yearly Plan</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B' }}>₹3,999</Typography>
                  <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>/ year</Typography>
                </Box>
              </Box>
            </Box>
            <Chip label="Save ₹989 (17%)" size="small" sx={{ alignSelf: 'flex-start', mb: 4, bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 800 }} />
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {['Up to 20 Employees', 'Advanced Payroll', 'Priority Support', 'Full HR & Analytics', 'Dedicated Account Manager'].map((feat, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 600 }}>{feat}</Typography>
                </Box>
              ))}
            </Box>
            
            <Button variant="contained" fullWidth sx={{ py: 1.5, borderRadius: '12px', bgcolor: '#10B981', color: '#FFFFFF', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}>Get Started</Button>
          </Paper>
        </Grid>

        {/* Plan 3: Yearly ₹6999 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #F59E0B', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#FFFBEB', color: '#F59E0B', width: 56, height: 56 }}><GroupsOutlinedIcon /></Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B' }}>Yearly Plan – 50 Employees</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B' }}>₹6,999</Typography>
                  <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 600 }}>/ year</Typography>
                </Box>
              </Box>
            </Box>
            <Chip label="Save ₹2,999 (30%)" size="small" sx={{ alignSelf: 'flex-start', mb: 4, bgcolor: '#FFFBEB', color: '#F59E0B', fontWeight: 800 }} />
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {['Up to 50 Employees', 'Advanced Payroll', 'Priority Support', 'Full HR & Analytics', 'Dedicated Account Manager', 'Role-based Access Control'].map((feat, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 600 }}>{feat}</Typography>
                </Box>
              ))}
            </Box>
            
            <Button variant="outlined" fullWidth sx={{ py: 1.5, borderRadius: '12px', borderColor: '#F59E0B', color: '#F59E0B', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#FFFBEB', borderColor: '#F59E0B' } }}>Get Started</Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Features Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
        {[
          { icon: <EventAvailableOutlinedIcon sx={{ color: '#10B981' }}/>, bg: '#ECFDF5', title: '7-Day Free Trial', sub: 'Full access to all features' },
          { icon: <CancelScheduleSendOutlinedIcon sx={{ color: '#6366F1' }}/>, bg: '#EEF2FF', title: 'Cancel Anytime', sub: 'No commitments' },
          { icon: <HttpsOutlinedIcon sx={{ color: '#3B82F6' }}/>, bg: '#EFF6FF', title: 'Secure Payment', sub: '100% secure & encrypted' },
          { icon: <SupportAgentOutlinedIcon sx={{ color: '#10B981' }}/>, bg: '#ECFDF5', title: '24/7 Support', sub: "We're here to help" },
        ].map((feat, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: feat.bg, width: 40, height: 40 }}>{feat.icon}</Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{feat.title}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>{feat.sub}</Typography>
            </Box>
          </Box>
        ))}
        
        {/* Contact Sales Float */}
        <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '16px', bgcolor: '#EEF2FF' }}>
          <Avatar sx={{ bgcolor: '#FFFFFF', color: '#4318FF' }}><HelpOutlineOutlinedIcon /></Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>Need help choosing a plan?</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>Our team is here to help you find the best plan for your organization.</Typography>
            <Link href="#" sx={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none' }}>Contact Sales</Link>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
};

export default SubscriptionPage;
