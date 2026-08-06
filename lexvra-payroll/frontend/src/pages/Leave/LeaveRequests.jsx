import React from 'react';
import { useSelector } from 'react-redux';
import AdminLeave from './AdminLeave';
import EmployeeLeave from './EmployeeLeave';

const LeaveRequests = () => {
  const { user } = useSelector((state) => state.auth);

  const role = user?.role?.toUpperCase();

  // If logged in user is regular EMPLOYEE, show Employee Leave dashboard
  if (role === 'EMPLOYEE') {
    return <EmployeeLeave />;
  }

  // Otherwise show Admin/HR Leave Management Dashboard
  return <AdminLeave />;
};

export default LeaveRequests;
