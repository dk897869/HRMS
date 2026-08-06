import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../guards/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Authentication/Login';
import DashboardRouter from '../pages/Dashboard/DashboardRouter';
import AdminDashboard from '../pages/Dashboard/Admin/AdminDashboard';
import EmployeeDashboard from '../pages/Dashboard/Employee/EmployeeDashboard';
import EmployeeList from '../pages/Employees/EmployeeList';
import AttendanceOverview from '../pages/Attendance/AttendanceOverview';
import LeaveRequests from '../pages/Leave/LeaveRequests';
import PayrollProcess from '../pages/Payroll/PayrollProcess';
import LoansAdvances from '../pages/Loans/LoansAdvances';
import ApprovalRequests from '../pages/Approvals/ApprovalRequests';
import ClaimsList from '../pages/Claims/ClaimsList';
import PerformanceReviews from '../pages/Performance/PerformanceReviews';
import JobPostings from '../pages/Recruitment/JobPostings';
import AssetsList from '../pages/Assets/AssetsList';
import DocumentsVault from '../pages/Documents/DocumentsVault';
import ReportsOverview from '../pages/Reports/ReportsOverview';
import SettingsPage from '../pages/Settings/SettingsPage';
import ProfileSettings from '../pages/Settings/ProfileSettings';
import RolePermissionManagement from '../pages/Permissions/RolePermissionManagement';
import HolidayCalendar from '../pages/Holidays/HolidayCalendar';
import Chats from '../pages/Chats/Chats';
import AIAssistantPage from '../pages/AIAssistant/AIAssistantPage';
import NotFound from '../pages/NotFound/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRouter />} />
        <Route path="employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="attendance" element={<AttendanceOverview />} />
        <Route path="leaves" element={<LeaveRequests />} />
        <Route path="payroll" element={<PayrollProcess />} />
        <Route path="loans" element={<LoansAdvances />} />
        <Route path="approvals" element={<ApprovalRequests />} />
        <Route path="claims" element={<ClaimsList />} />
        <Route path="reimbursements" element={<ClaimsList />} />
        <Route path="performance" element={<PerformanceReviews />} />
        <Route path="recruitment" element={<JobPostings />} />
        <Route path="assets" element={<AssetsList />} />
        <Route path="documents" element={<DocumentsVault />} />
        <Route path="chats" element={<Chats />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="reports" element={<ReportsOverview />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="roles" element={<RolePermissionManagement />} />
        <Route path="holidays" element={<HolidayCalendar />} />
      </Route>

      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
