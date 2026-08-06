import React, { useState } from 'react';
import { Box, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const SIDEBAR_WIDTH = 252;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6FA', width: '100vw', overflowX: 'hidden' }}>
      {/* Desktop Permanent Sidebar */}
      <Box sx={{ display: { xs: 'none', lg: 'block' }, flexShrink: 0 }}>
        <Sidebar />
      </Box>

      {/* Mobile Temporary Drawer Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH, border: 'none' },
        }}
      >
        <Sidebar onMobileItemClick={handleDrawerToggle} />
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, lg: `${SIDEBAR_WIDTH}px` },
          width: { xs: '100%', lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          minWidth: 0,
          boxSizing: 'border-box',
          bgcolor: '#F4F6FA',
          minHeight: '100vh',
        }}
      >
        <Header onMobileMenuToggle={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: '100%',
            boxSizing: 'border-box',
            animation: 'fadeInUp 0.35s ease both',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(12px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
