import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Divider, Chip } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import DevicesIcon from '@mui/icons-material/Devices';

const adminNavItems = [
  {
    section: 'OVERVIEW',
    items: [
      { text: 'Dashboard', icon: DashboardOutlinedIcon, path: '/dashboard' },
    ]
  },
  {
    section: 'WORKFORCE',
    items: [
      { text: 'Employees', icon: PeopleOutlinedIcon, path: '/employees' },
      { text: 'Attendance', icon: AccessTimeOutlinedIcon, path: '/attendance' },
      { text: 'Leave', icon: EventAvailableOutlinedIcon, path: '/leaves' },
    ]
  },
  {
    section: 'FINANCE',
    items: [
      { text: 'Payroll', icon: AccountBalanceWalletOutlinedIcon, path: '/payroll' },
      { text: 'Loans & Advances', icon: AccountBalanceOutlinedIcon, path: '/loans' },
      { text: 'Reimbursements', icon: ReceiptLongOutlinedIcon, path: '/claims' },
      { text: 'Assets Management', icon: DevicesIcon, path: '/assets' },
    ]
  },
  {
    section: 'MANAGEMENT',
    items: [
      { text: 'Approvals', icon: HowToRegOutlinedIcon, path: '/approvals' },
      { text: 'Performance', icon: TrendingUpOutlinedIcon, path: '/performance' },
      { text: 'Documents', icon: DescriptionOutlinedIcon, path: '/documents' },
      { text: 'Chats', icon: ChatOutlinedIcon, path: '/chats' },
      { text: 'LX Intelligence', icon: AutoAwesomeIcon, path: '/ai-assistant' },
      { text: 'Reports', icon: AssessmentOutlinedIcon, path: '/reports' },
    ]
  },
  {
    section: 'SYSTEM',
    items: [
      { text: 'Settings', icon: SettingsOutlinedIcon, path: '/settings' },
      { text: 'Subscription', icon: CardMembershipOutlinedIcon, path: '/subscription' },
    ]
  }
];

const employeeNavItems = [
  {
    section: 'OVERVIEW',
    items: [
      { text: 'Dashboard', icon: DashboardOutlinedIcon, path: '/dashboard' },
      { text: 'My Profile', icon: PersonOutlinedIcon, path: '/profile' },
    ]
  },
  {
    section: 'WORK',
    items: [
      { text: 'Attendance', icon: AccessTimeOutlinedIcon, path: '/attendance' },
      { text: 'Leaves', icon: EventAvailableOutlinedIcon, path: '/leaves' },
      { text: 'Salary & Payslips', icon: AccountBalanceWalletOutlinedIcon, path: '/payroll' },
      { text: 'Documents', icon: DescriptionOutlinedIcon, path: '/documents' },
      { text: 'Chats', icon: ChatOutlinedIcon, path: '/chats' },
      { text: 'LX Intelligence', icon: AutoAwesomeIcon, path: '/ai-assistant' },
    ]
  }
];

const Sidebar = ({ onMobileItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const isEmployee = user?.role?.toUpperCase() === 'EMPLOYEE';
  const navSections = isEmployee ? employeeNavItems : adminNavItems;

  const [openNav, setOpenNav] = React.useState(false);
  const [companySettings, setCompanySettings] = React.useState(null);

  React.useEffect(() => {
    axiosClient.get('/settings')
      .then(res => setCompanySettings(res.data?.data || res.data))
      .catch(() => {});
  }, []);

  const handleItemClick = (path) => {
    navigate(path);
    if (onMobileItemClick) onMobileItemClick();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <Box
      sx={{
        width: 252,
        height: '100vh',
        bgcolor: '#FFFFFF',
        color: '#1E293B',
        display: 'flex',
        flexDirection: 'column',
        position: { xs: 'static', lg: 'fixed' },
        top: 0,
        left: 0,
        zIndex: 1200,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '4px' },
        borderRight: '1px solid #E2E8F0',
        boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {companySettings?.companyLogoUrl ? (
          <Box component="img" src={companySettings.companyLogoUrl} alt="Company Logo" sx={{ height: 65, objectFit: 'contain', width: 'auto', maxWidth: '100%' }} />
        ) : (
          <>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px', flexShrink: 0 }}>
              LX
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', letterSpacing: '0.5px', lineHeight: 1, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
                {companySettings?.companyName || 'LEXVRA'}
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '1px', mt: 0.2 }}>
                HRMS PLATFORM
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Navigation Sections */}
      <Box sx={{ px: 1.5, flexGrow: 1, py: 1.5 }}>
        {navSections.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: 0.5 }}>
            <Typography sx={{
              color: '#94A3B8',
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '1px',
              px: 1.5,
              py: 0.8,
              display: 'block',
              textTransform: 'uppercase',
            }}>
              {section.section}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.2 }}>
                    <ListItemButton
                      onClick={() => handleItemClick(item.path)}
                      sx={{
                        borderRadius: '10px',
                        py: 0.9,
                        px: 1.4,
                        position: 'relative',
                        bgcolor: isActive ? '#EFF6FF' : 'transparent',
                        color: isActive ? '#2563EB' : '#64748B',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isActive ? '#EFF6FF' : '#F8FAFC',
                          color: isActive ? '#2563EB' : '#0F172A',
                        },
                      }}
                    >
                      {isActive && (
                        <Box sx={{
                          position: 'absolute',
                          left: 0,
                          top: '18%',
                          bottom: '18%',
                          width: '3px',
                          borderRadius: '0 3px 3px 0',
                          background: 'linear-gradient(to bottom, #2563EB, #6366F1)',
                        }} />
                      )}
                      <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#2563EB' : '#94A3B8' }}>
                        <Icon sx={{ fontSize: '1.1rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.82rem',
                          fontWeight: isActive ? 700 : 500,
                          fontFamily: 'Inter, sans-serif',
                          color: isActive ? '#2563EB' : '#475569',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Upgrade Banner */}
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Box sx={{
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          mb: 1.5,
        }}>
          <Box sx={{
            position: 'absolute', top: -20, right: -20,
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)'
          }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#FFFFFF', lineHeight: 1.3, mb: 0.4 }}>
            Empower People 🚀
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, mb: 1 }}>
            Manage your entire workforce from one place.
          </Typography>
          <Box
            onClick={() => navigate('/profile')}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '20px',
              px: 1.5, py: 0.5, cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              transition: 'all 0.15s ease',
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#FFFFFF' }}>My Profile →</Typography>
          </Box>
        </Box>
      </Box>

      {/* User Card at Bottom */}
      <Box sx={{ px: 1.5, pb: 2, borderTop: '1px solid #F1F5F9', pt: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            p: 1.2,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: '#F1F5F9' }
          }}
          onClick={() => navigate('/profile')}
        >
          <Avatar
            src={user?.avatar || ''}
            alt={user?.name || 'User'}
            sx={{ width: 32, height: 32, bgcolor: '#2563EB', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 500 }}>
              {user?.role || 'Employee'}
            </Typography>
          </Box>
          <Box
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            sx={{
              color: '#CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: '6px',
              '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' },
              transition: 'all 0.15s ease'
            }}
          >
            <LogoutIcon sx={{ fontSize: '1rem' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
