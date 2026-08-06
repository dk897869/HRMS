import React from 'react';
import { useSelector } from 'react-redux';
import AdminPayroll from './AdminPayroll';
import EmployeePayroll from './EmployeePayroll';

const PayrollProcess = () => {
  const { user } = useSelector((state) => state.auth);

  const role = user?.role?.toUpperCase();

  // If logged in user is regular EMPLOYEE, show Employee Payroll (My Salary)
  if (role === 'EMPLOYEE') {
    return <EmployeePayroll />;
  }

  // Otherwise show Admin/HR Payroll Dashboard
  return <AdminPayroll />;
};

export default PayrollProcess;
