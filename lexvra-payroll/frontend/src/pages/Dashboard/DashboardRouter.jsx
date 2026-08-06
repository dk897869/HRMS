import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from './Admin/AdminDashboard';
import EmployeeDashboard from './Employee/EmployeeDashboard';

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  const role = user?.role?.toUpperCase();

  // If logged in user is regular EMPLOYEE, show Employee Dashboard DITTO!
  if (role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }

  // Otherwise show Admin/HR Dashboard
  return <AdminDashboard />;
};

export default DashboardRouter;
