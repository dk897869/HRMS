import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Avatar, IconButton, Badge,
  Menu, MenuItem, TextField, InputAdornment, Tooltip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import { io } from 'socket.io-client';

import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const Header = ({ onMobileMenuToggle }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const [settings, setSettings] = useState(null);
  useEffect(() => {
    axiosClient.get('/settings').then(res => setSettings(res.data?.data || res.data)).catch(() => {});
  }, []);

  const trialDaysLeft = settings?.trialStartDate
    ? Math.max(0, 7 - Math.floor((new Date() - new Date(settings.trialStartDate)) / (1000 * 60 * 60 * 24)))
    : 7;

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Get current date string
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://lx-hrms-1.onrender.com');
      const empId = typeof user.employeeRef === 'object' ? user.employeeRef?._id : user.employeeRef;
      const userId = user._id || user.id;

      if (empId) socket.emit('join_user_room', empId);
      if (userId) socket.emit('join_user_room', userId);

      socket.on('new_notification', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.success(`${newNotif.title}: ${newNotif.message}`, { icon: '🔔', duration: 5000 });
      });

      socket.on('new_approval_request', (approvalReq) => {
        toast.success(`New Approval Request from ${approvalReq.employeeName}`, { icon: '⏰', duration: 5000 });
        fetchNotifications();
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const empId = typeof user.employeeRef === 'object' ? user.employeeRef?._id : user.employeeRef;
      const userId = user._id || user.id;
      const targetId = empId || userId;
      if (!targetId) return;

      const res = await axiosClient.get(`/notifications/my?employeeId=${targetId}`);
      const data = res.notifications || res.data?.notifications || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to remove notification');
    }
  };

  const handleClearAllNotifs = async () => {
    try {
      const empId = typeof user?.employeeRef === 'object' ? user?.employeeRef?._id : user?.employeeRef;
      const userId = user?._id || user?.id;
      const targetId = empId || userId;
      await axiosClient.delete(`/notifications/clear-all?employeeId=${targetId}`);
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotifClick = (n) => {
    if (!n.read) handleMarkAsRead(n._id);
    if (n.type === 'BIRTHDAY_WISH') {
      setSelectedNotif(n);
      setReplyDialogOpen(true);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await axiosClient.post('/notifications/send', {
        title: 'Reply: Birthday Wish',
        message: replyText,
        type: 'GENERAL',
        recipient: selectedNotif.sender?._id || selectedNotif.sender,
      });
      toast.success('Reply sent successfully!');
      setReplyDialogOpen(false);
      setReplyText('');
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        borderBottom: '1px solid #E2E8F0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255,255,255,0.95)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 60, px: { xs: 2, sm: 3 } }}>
        {/* Left: Hamburger + Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { lg: 'none' }, color: '#475569', bgcolor: '#F8FAFC', borderRadius: '8px', p: 0.8 }}
          >
            <MenuIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>

          {/* Search */}
          <Box sx={{ width: { xs: 180, sm: 300 }, display: { xs: 'none', sm: 'block' } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search employees, reports..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: '1rem' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.82rem',
                  color: '#64748B',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                },
              }}
            />
          </Box>
        </Box>

        {/* Right: Actions + Date + User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Subscription Free Trial & Upgrade */}
          {settings?.subscriptionPlan === 'Free Trial' && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 1 }}>
              <Box sx={{ bgcolor: '#FFF1F2', color: '#E11D48', px: 1.5, py: 0.5, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #FFE4E6' }}>
                {trialDaysLeft} Days Free Trial Left
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/subscription')}
                sx={{ bgcolor: '#E11D48', color: '#fff', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px', '&:hover': { bgcolor: '#BE123C' }, textTransform: 'none', px: 2 }}
              >
                Upgrade
              </Button>
            </Box>
          )}

          {/* Date Display */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.8, px: 1.5, py: 0.7, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', mr: 0.5 }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: '0.95rem', color: '#64748B' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
              {today}
            </Typography>
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', p: 0.9 }}
            >
              <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
                <NotificationsOutlinedIcon sx={{ color: '#475569', fontSize: '1.1rem' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notification Dropdown */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{
              sx: { mt: 1.5, borderRadius: '14px', minWidth: 320, maxWidth: 350, maxHeight: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>Notifications</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{unreadCount} unread</Typography>
              </Box>
              {notifications.length > 0 && (
                <Button size="small" onClick={handleClearAllNotifs} startIcon={<DeleteSweepIcon sx={{ fontSize: '0.9rem' }} />} sx={{ color: '#EF4444', textTransform: 'none', fontWeight: 700, fontSize: '0.72rem' }}>
                  Clear All
                </Button>
              )}
            </Box>
            {notifications.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>No notifications</Typography>
              </Box>
            )}
            {notifications.map((n, i) => (
              <MenuItem key={n._id || i} onClick={() => handleNotifClick(n)} sx={{ py: 1.2, px: 2, '&:hover': { bgcolor: '#F8FAFC' }, whiteSpace: 'normal', position: 'relative' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%' }}>
                  <Box sx={{ fontSize: '1.2rem', mt: 0.2 }}>{n.type === 'BIRTHDAY_WISH' ? '🎉' : n.type === 'CERTIFICATE' ? '🏆' : '🔔'}</Box>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: !n.read ? 800 : 500, color: '#0F172A', display: 'block', mb: 0.3 }}>{n.title}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748B', display: 'block', lineHeight: 1.2 }}>{n.message}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', mt: 0.5 }}>{new Date(n.createdAt).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {!n.read && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2563EB', flexShrink: 0 }} />}
                    <IconButton size="small" onClick={(e) => handleDeleteNotif(e, n._id)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' }, p: 0.3 }}>
                      <CloseIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* User Profile Button */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: 0.5,
              cursor: 'pointer',
              py: 0.6,
              px: 1.2,
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
              transition: 'all 0.15s ease',
            }}
          >
            <Avatar
              src={user?.avatar || ''}
              alt={user?.name || 'User'}
              sx={{ width: 30, height: 30, bgcolor: '#2563EB', fontSize: '0.78rem', fontWeight: 800 }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, color: '#0F172A' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.65rem', display: 'block' }}>
                {user?.role || 'Admin'}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: '#94A3B8', fontSize: '1rem' }} />
          </Box>

          {/* Profile Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { mt: 1.5, borderRadius: '14px', minWidth: 180, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', p: 0.5 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ borderRadius: '8px', py: 0.9, fontSize: '0.82rem', fontWeight: 600 }}>
              <PersonIcon fontSize="small" sx={{ mr: 1.5, color: '#64748B' }} /> Profile Settings
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', py: 0.9, fontSize: '0.82rem', fontWeight: 600, color: '#EF4444' }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Birthday Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          🎉 Reply to Birthday Wish
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748B', mb: 2 }}>
            Original message: <strong>{selectedNotif?.message}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your thank you message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ '& fieldset': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setReplyDialogOpen(false)} sx={{ color: '#64748B', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSendReply} disabled={!replyText.trim()} sx={{ borderRadius: '10px', bgcolor: '#2563EB', fontWeight: 700 }}>Send Reply</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;
