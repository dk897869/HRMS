import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { saLogout } from '../redux/slices/superAdminAuthSlice';

const drawerWidth = 260;

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.superAdminAuth);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/super-admin/dashboard' },
    { text: 'Companies', icon: <BusinessIcon />, path: '/super-admin/companies' },
    { text: 'Subscriptions', icon: <ReceiptIcon />, path: '/super-admin/subscriptions' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/super-admin/settings' },
  ];

  const handleLogout = () => {
    dispatch(saLogout());
    navigate('/super-admin/login');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0'
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#4318FF', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 900 }}>S</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>Super Admin</Typography>
        </Box>

        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => navigate(item.path)}
                sx={{ 
                  borderRadius: '12px',
                  mb: 1,
                  bgcolor: isActive ? '#F1F5F9' : 'transparent',
                  color: isActive ? '#4318FF' : '#64748B',
                  '&:hover': { bgcolor: '#F8FAFC' }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, fontSize: '0.95rem' }} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${drawerWidth}px)` }}>
        
        {/* Topbar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar src={user?.avatar} sx={{ width: 40, height: 40, border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 150, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }}>
            <MenuItem onClick={handleLogout} sx={{ color: '#E11D48', fontWeight: 600 }}><LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout</MenuItem>
          </Menu>
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;
