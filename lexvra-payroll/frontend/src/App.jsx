import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import theme from './theme/muiTheme';
import AppRoutes from './routes/AppRoutes';

// Super Admin Pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminLogin from './pages/SuperAdmin/Auth/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard/SuperAdminDashboard';
import CompaniesList from './pages/SuperAdmin/Companies/CompaniesList';
import CompanyDetails from './pages/SuperAdmin/Companies/CompanyDetails';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Super Admin Routes */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="companies" element={<CompaniesList />} />
              <Route path="companies/:id" element={<CompanyDetails />} />
            </Route>

            {/* Default App Routes */}
            <Route path="*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
