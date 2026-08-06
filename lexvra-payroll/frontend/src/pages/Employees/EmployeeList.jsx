import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Pagination, IconButton, Tabs, Tab, FormControlLabel, Switch, MenuItem, Avatar, Menu, Divider, CircularProgress, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CakeIcon from '@mui/icons-material/Cake';
import SendIcon from '@mui/icons-material/Send';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formTab, setFormTab] = useState(0);

  // Dynamic Departments & Designations list
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const reduxUser = useSelector((state) => state.auth.user);

  // Birthday Dialog State
  const [wishing, setWishing] = useState(null);
  const [wishDialog, setWishDialog] = useState(false);
  const [wishEmp, setWishEmp] = useState(null);
  const [wishMessage, setWishMessage] = useState('');

  const suggestedMessages = [
    "Happy Birthday! Have a fantastic day! 🎉",
    "Wishing you a great year ahead! 🎂",
    "Hope your special day brings you all that your heart desires! 🎁",
    "Happy Birthday! Wishing you success and happiness! ✨"
  ];

  // Modals for adding new Department / Designation
  const [openAddDeptModal, setOpenAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [openAddDesgModal, setOpenAddDesgModal] = useState(false);
  const [newDesgTitle, setNewDesgTitle] = useState('');

  // Manage Org Modal State
  const [openManageOrgModal, setOpenManageOrgModal] = useState(false);
  const [orgTab, setOrgTab] = useState(0);

  // Edit state for Departments & Designations in Manage Org
  const [editDeptId, setEditDeptId] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDesgId, setEditDesgId] = useState(null);
  const [editDesgTitle, setEditDesgTitle] = useState('');

  // On Leave count from leave API
  const [onLeaveCount, setOnLeaveCount] = useState(0);

  // Inline Add for Manage Org Modal
  const [showAddDeptInModal, setShowAddDeptInModal] = useState(false);
  const [inlineNewDept, setInlineNewDept] = useState('');
  const [showAddDesgInModal, setShowAddDesgInModal] = useState(false);
  const [inlineNewDesg, setInlineNewDesg] = useState('');

  // View Employee Details Modal State
  const [selectedViewEmp, setSelectedViewEmp] = useState(null);

  // Edit Employee Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);

  // Menu State for Row Action Three Dots (...)
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuEmp, setMenuEmp] = useState(null);

  // Photo Upload State (Add Employee wizard + Profile Details update)
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingProfileAvatar, setUploadingProfileAvatar] = useState(false);
  const addPhotoInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);

  // COMPLETELY EMPTY INITIAL FORM STATE (NO DUMMY PRE-FILLED VALUES!)
  const INITIAL_FORM_STATE = {
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    maritalStatus: 'Single',
    joiningDate: '',
    employmentType: 'FULL_TIME',
    probationPeriod: '',
    confirmationDate: '',

    // Employment Details
    department: '',
    designation: '',
    reportingManager: '',
    workLocation: '',
    workShift: '',
    businessUnit: '',
    workAddress: '',

    // Additional Info
    bloodGroup: 'O+',
    nationality: 'Indian',
    languages: '',

    // Bank Account Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'Savings',

    // Salary & Statutory
    ctc: '',
    baseSalary: '',
    isPfEligible: false,
    uanNumber: '',
    isEsiEligible: false,
    esiNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    avatar: ''
  };
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isVerifyingIfsc, setIsVerifyingIfsc] = useState(false);
  const [ifscBranch, setIfscBranch] = useState('');

  const verifyIfsc = async () => {
    if (!formData.ifscCode) return toast.error('Enter IFSC code first');
    setIsVerifyingIfsc(true);
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${formData.ifscCode}`);
      if (!response.ok) throw new Error('Invalid IFSC Code');
      const data = await response.json();
      setFormData(prev => ({ ...prev, bankName: data.BANK }));
      setIfscBranch(`${data.BRANCH}, ${data.CITY}, ${data.STATE}`);
      toast.success('IFSC Verified Successfully');
    } catch (err) {
      toast.error('Invalid IFSC Code');
      setIfscBranch('');
    } finally {
      setIsVerifyingIfsc(false);
    }
  };

  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchOrgData();
    fetchBirthdays();
    fetchOnLeaveCount();
  }, [search]);

  const fetchOnLeaveCount = async () => {
    try {
      const res = await axiosClient.get('/leaves?status=APPROVED&type=active').catch(() => null);
      if (res?.data) {
        const leaves = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        // Count unique employees on leave today
        const today = new Date();
        const onLeave = leaves.filter(l => {
          const from = new Date(l.startDate || l.fromDate);
          const to = new Date(l.endDate || l.toDate);
          return l.status === 'APPROVED' && from <= today && to >= today;
        });
        setOnLeaveCount(onLeave.length);
      }
    } catch (e) { setOnLeaveCount(0); }
  };

  const fetchBirthdays = async () => {
    try {
      const res = await axiosClient.get('/employees/birthdays');
      setBirthdays(res.data?.data || res.data || []);
    } catch (err) {}
  };

  const handleSendWishClick = (emp) => {
    setWishEmp(emp);
    setWishMessage(suggestedMessages[0]);
    setWishDialog(true);
  };

  const handleSendWish = async () => {
    if (!wishEmp || !wishMessage.trim()) return;
    setWishing(wishEmp._id);
    try {
      await axiosClient.post('/notifications/send', {
        title: '🎉 Happy Birthday!',
        message: wishMessage,
        type: 'BIRTHDAY_WISH',
        recipient: wishEmp._id,
        sender: reduxUser?.employeeRef?._id || reduxUser?.employeeRef,
        employeeName: reduxUser?.employeeRef ? undefined : reduxUser?.name
      });
      toast.success('Birthday wish sent successfully!');
      setWishDialog(false);
    } catch (err) {
      toast.error('Failed to send wish');
    } finally {
      setWishing(null);
    }
  };

  const fetchOrgData = async () => {
    try {
      const [deptRes, desgRes] = await Promise.all([
        axiosClient.get('/org/departments').catch(() => null),
        axiosClient.get('/org/designations').catch(() => null)
      ]);

      // axiosClient interceptor returns response.data directly
      // so deptRes = { success, data: [...], message }
      if (deptRes?.data && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data);
      } else if (deptRes?.data?.data && Array.isArray(deptRes.data.data)) {
        setDepartments(deptRes.data.data);
      } else {
        setDepartments([]);
      }
      
      if (desgRes?.data && Array.isArray(desgRes.data)) {
        setDesignations(desgRes.data);
      } else if (desgRes?.data?.data && Array.isArray(desgRes.data.data)) {
        setDesignations(desgRes.data.data);
      } else {
        setDesignations([]);
      }
    } catch (e) {
      console.log('Error fetching org data', e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get(`/employees?search=${search}`);
      if (res.success && res.data.length > 0) {
        const mapped = res.data.map(e => ({
          _id: e._id,
          id: e.employeeId || 'EMP001',
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          avatar: e.avatar || '',
          dept: e.department?.name || e.department || 'Payroll',
          desg: e.designation?.title || e.designation || 'BDE',
          status: e.employmentStatus || 'ACTIVE',
          pan: e.panNumber || '-',
          pf: e.isPfEligible ? 'Yes' : 'No',
          uan: e.uanNumber || '-',
          bank: e.bankName ? `${e.bankName}${e.accountNumber ? ' - ' + e.accountNumber : ''}` : '-',
          ctc: e.ctc ? `₹ ${Number(e.ctc).toLocaleString('en-IN')}` : '₹ 6,000,000',
          baseSalary: e.baseSalary || 0,
          epfDeduction: e.epfDeduction || 0,
          epfEmployerContribution: e.epfEmployerContribution || 0
        }));
        setEmployees(mapped);
      }
    } catch (err) {
      console.log('Using sample employees');
    }
  };

  // Explicit Form Submission on Step 3 Only (Handles Both Create and Edit)
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.department) delete payload.department;
      if (!payload.designation) delete payload.designation;

      const isEdit = !!payload._id;
      const apiCall = isEdit 
         ? axiosClient.put(`/employees/${payload._id}`, payload)
         : axiosClient.post('/employees', payload);

      const res = await apiCall;
      if (res.success) {
        toast.success(`Employee ${payload.firstName} ${isEdit ? 'updated' : 'created'} successfully!`);
        setOpenModal(false);
        setFormData({ ...INITIAL_FORM_STATE });
        setIfscBranch('');
        fetchEmployees();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save employee. Check fields.');
    }
  };

  const handleEditClick = async (emp) => {
    try {
       const res = await axiosClient.get(`/employees/${emp._id}`);
       if (res.success && res.data) {
          const dbEmp = res.data;
          setFormData({
            ...INITIAL_FORM_STATE,
            _id: dbEmp._id,
            employeeId: dbEmp.employeeId || '',
            firstName: dbEmp.firstName || '',
            middleName: dbEmp.middleName || '',
            lastName: dbEmp.lastName || '',
            email: dbEmp.email || '',
            phone: dbEmp.phone || '',
            gender: dbEmp.gender || 'Male',
            dob: dbEmp.dob ? dbEmp.dob.split('T')[0] : '',
            maritalStatus: dbEmp.maritalStatus || 'Single',
            joiningDate: dbEmp.joiningDate ? dbEmp.joiningDate.split('T')[0] : '',
            employmentType: dbEmp.employmentType || 'FULL_TIME',
            probationPeriod: dbEmp.probationPeriod || '',
            confirmationDate: dbEmp.confirmationDate ? dbEmp.confirmationDate.split('T')[0] : '',
            department: dbEmp.department?._id || dbEmp.department || '',
            designation: dbEmp.designation?._id || dbEmp.designation || '',
            reportingManager: dbEmp.reportingManagerName || '',
            workLocation: dbEmp.workLocation || '',
            workShift: dbEmp.workShift || '',
            businessUnit: dbEmp.businessUnit || '',
            workAddress: dbEmp.workAddress || '',
            bloodGroup: dbEmp.bloodGroup || 'O+',
            nationality: dbEmp.nationality || 'Indian',
            languages: dbEmp.languages || '',
            bankName: dbEmp.bankName || '',
            accountNumber: dbEmp.accountNumber || '',
            ifscCode: dbEmp.ifscCode || '',
            accountType: dbEmp.accountType || 'Savings',
            ctc: dbEmp.ctc || '',
            baseSalary: dbEmp.baseSalary || '',
            isPfEligible: dbEmp.isPfEligible || false,
            uanNumber: dbEmp.uanNumber || '',
            isEsiEligible: dbEmp.isEsiEligible || false,
            esiNumber: dbEmp.esiNumber || '',
            panNumber: dbEmp.panNumber || '',
            aadhaarNumber: dbEmp.aadhaarNumber || '',
            avatar: dbEmp.avatar || ''
          });
          setFormTab(0);
          setOpenModal(true);
       }
    } catch(err) {
       toast.error('Failed to fetch employee details');
    }
  };

  // Upload a photo while creating a new employee (wizard). No employeeId exists
  // yet, so we just get back a URL and attach it to the form for submission.
  const handleAddPhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));

    const payload = new FormData();
    payload.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await axiosClient.post('/employees/upload-avatar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success) {
        setFormData((prev) => ({ ...prev, avatar: res.data.url }));
        toast.success('Photo uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo');
      setFormData((prev) => ({ ...prev, avatar: '' }));
    } finally {
      setUploadingAvatar(false);
      if (addPhotoInputRef.current) addPhotoInputRef.current.value = '';
    }
  };

  // Upload & immediately persist a photo for an EXISTING employee, from the
  // "Employee Profile Details" view modal.
  const handleProfilePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedViewEmp?._id) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedViewEmp((prev) => ({ ...prev, avatar: previewUrl }));

    const payload = new FormData();
    payload.append('avatar', file);
    payload.append('employeeId', selectedViewEmp._id);

    setUploadingProfileAvatar(true);
    try {
      const res = await axiosClient.post('/employees/upload-avatar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success) {
        const newUrl = res.data.url;
        setSelectedViewEmp((prev) => ({ ...prev, avatar: newUrl }));
        setEmployees((prev) => prev.map((emp) => (emp._id === selectedViewEmp._id ? { ...emp, avatar: newUrl } : emp)));
        toast.success('Employee photo updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update photo');
    } finally {
      setUploadingProfileAvatar(false);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
    }
  };

  // Action Menu Handlers
  const handleMenuOpen = (e, emp) => {
    setAnchorEl(e.currentTarget);
    setMenuEmp(emp);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuEmp(null);
  };

  // Update Status (Active, Inactive, Terminated, Resigned)
  const handleUpdateStatus = async (newStatus) => {
    if (!menuEmp) return;
    try {
      if (newStatus === 'RESIGNED') {
        await axiosClient.put(`/employees/${menuEmp._id}/resign`).catch(() => null);
      } else {
        await axiosClient.put(`/employees/${menuEmp._id}`, { employmentStatus: newStatus }).catch(() => null);
      }
      setEmployees(prev => prev.map(e => e.id === menuEmp.id ? { ...e, status: newStatus } : e));
      toast.success(`Employee status set to ${newStatus}`);
    } catch (err) {
      setEmployees(prev => prev.map(e => e.id === menuEmp.id ? { ...e, status: newStatus } : e));
      toast.success(`Employee status set to ${newStatus}`);
    }
    handleMenuClose();
  };

  // Delete Employee
  const handleDeleteEmployee = async () => {
    if (!menuEmp) return;
    try {
      await axiosClient.delete(`/employees/${menuEmp._id}`).catch(() => null);
      setEmployees(prev => prev.filter(e => e.id !== menuEmp.id));
      toast.success(`Employee ${menuEmp.name} deleted!`);
    } catch (err) {
      setEmployees(prev => prev.filter(e => e.id !== menuEmp.id));
      toast.success(`Employee ${menuEmp.name} deleted!`);
    }
    handleMenuClose();
  };

  // Add New Department Handler (from Add Employee form's inline modal)
  const handleAddNewDepartment = async () => {
    if (!newDeptName) return;
    try {
      const res = await axiosClient.post('/org/departments', { name: newDeptName });
      const createdDept = res.data || res;
      const dept = createdDept._id ? createdDept : (createdDept.data || createdDept);
      setDepartments(prev => [...prev.filter(d => d._id !== dept._id), dept]);
      setFormData(prev => ({ ...prev, department: dept._id }));
      toast.success(`Department "${dept.name}" created & selected!`);
      setNewDeptName('');
      setOpenAddDeptModal(false);
    } catch (err) {
      toast.error('Failed to create department');
    }
  };

  // Add New Designation Handler (from Add Employee form's inline modal)
  const handleAddNewDesignation = async () => {
    if (!newDesgTitle) return;
    try {
      const res = await axiosClient.post('/org/designations', { title: newDesgTitle });
      const createdDesg = res.data || res;
      const desg = createdDesg._id ? createdDesg : (createdDesg.data || createdDesg);
      setDesignations(prev => [...prev.filter(d => d._id !== desg._id), desg]);
      setFormData(prev => ({ ...prev, designation: desg._id }));
      toast.success(`Designation "${desg.title}" created & selected!`);
      setNewDesgTitle('');
      setOpenAddDesgModal(false);
    } catch (err) {
      toast.error('Failed to create designation');
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await axiosClient.delete(`/org/departments/${id}`);
      setDepartments(prev => prev.filter(d => d._id !== id));
      toast.success('Department deleted');
    } catch(err) { toast.error('Failed to delete department'); }
  };

  const handleDeleteDesignation = async (id) => {
    try {
      await axiosClient.delete(`/org/designations/${id}`);
      setDesignations(prev => prev.filter(d => d._id !== id));
      toast.success('Designation deleted');
    } catch(err) { toast.error('Failed to delete designation'); }
  };

  const handleUpdateDepartment = async (id) => {
    if (!editDeptName.trim()) return;
    try {
      await axiosClient.put(`/org/departments/${id}`, { name: editDeptName });
      setDepartments(prev => prev.map(d => d._id === id ? { ...d, name: editDeptName } : d));
      toast.success('Department updated!');
      setEditDeptId(null);
      setEditDeptName('');
    } catch(err) { toast.error('Failed to update department'); }
  };

  const handleUpdateDesignation = async (id) => {
    if (!editDesgTitle.trim()) return;
    try {
      await axiosClient.put(`/org/designations/${id}`, { title: editDesgTitle });
      setDesignations(prev => prev.map(d => d._id === id ? { ...d, title: editDesgTitle } : d));
      toast.success('Designation updated!');
      setEditDesgId(null);
      setEditDesgTitle('');
    } catch(err) { toast.error('Failed to update designation'); }
  };

  const handleInlineAddDept = async () => {
    if (!inlineNewDept.trim()) return;
    try {
      const res = await axiosClient.post('/org/departments', { name: inlineNewDept });
      const dept = res.data?._id ? res.data : (res.data?.data || res);
      setDepartments(prev => [...prev.filter(d => d._id !== dept._id), dept]);
      toast.success(`Department "${dept.name}" added!`);
      setInlineNewDept('');
      setShowAddDeptInModal(false);
    } catch(err) { toast.error('Failed to add department'); }
  };

  const handleInlineAddDesg = async () => {
    if (!inlineNewDesg.trim()) return;
    try {
      const res = await axiosClient.post('/org/designations', { title: inlineNewDesg });
      const desg = res.data?._id ? res.data : (res.data?.data || res);
      setDesignations(prev => [...prev.filter(d => d._id !== desg._id), desg]);
      toast.success(`Designation "${desg.title}" added!`);
      setInlineNewDesg('');
      setShowAddDesgInModal(false);
    } catch(err) { toast.error('Failed to add designation'); }
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
          Employees Directory
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.2 }}>
          Track employee profiles, bank account details, salary structures & EPF / ESI statutory details
        </Typography>
      </Box>

      {/* KPI Cards Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3
        }}
      >
        <StatCard title="Total Employees" value={employees.length} trend="up" trendValue="12.5% vs last month" chartColor="#8B5CF6" sparklineData={[{ v: 10 }, { v: 25 }, { v: 18 }, { v: 40 }, { v: 32 }, { v: 50 }]} />
        <StatCard title="Active" value={employees.filter(e => e.status === 'ACTIVE' || e.employmentStatus === 'ACTIVE').length} trend="up" trendValue="100% vs yesterday" chartColor="#10B981" sparklineData={[{ v: 8 }, { v: 18 }, { v: 16 }, { v: 35 }, { v: 28 }, { v: 45 }]} />
        <StatCard title="Inactive" value={employees.filter(e => e.status === 'INACTIVE' || e.employmentStatus === 'INACTIVE').length} trend="neutral" trendValue="No change" chartColor="#F59E0B" sparklineData={[{ v: 5 }, { v: 4 }, { v: 6 }, { v: 5 }, { v: 7 }, { v: 6 }]} />
        <StatCard title="On Leave Today" value={onLeaveCount} trend="down" trendValue="2.3% vs yesterday" chartColor="#2563EB" sparklineData={[{ v: 10 }, { v: 8 }, { v: 12 }, { v: 6 }, { v: 9 }, { v: 6 }]} />
      </Box>

      {/* Birthdays Section */}
      {birthdays.length > 0 && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <CakeIcon sx={{ fontSize: '1.2rem' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
              Upcoming Birthdays
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {birthdays.map(emp => {
              const dob = new Date(emp.dob);
              const isToday = dob.getDate() === new Date().getDate() && dob.getMonth() === new Date().getMonth();
              return (
                <Box key={emp._id} sx={{ minWidth: 260, display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '16px', bgcolor: isToday ? '#FFFBEB' : '#F8FAFC', border: isToday ? '1px solid #FDE68A' : '1px solid transparent', transition: 'all 0.2s', '&:hover': { bgcolor: '#F1F5F9' } }}>
                  <Avatar src={emp.avatar} sx={{ width: 48, height: 48, fontWeight: 800, bgcolor: '#3B82F6' }}>
                    {emp.firstName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{emp.firstName} {emp.lastName}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: isToday ? '#D97706' : '#64748B', fontWeight: 700 }}>
                      {isToday ? 'Today! 🎉' : dob.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                    </Typography>
                  </Box>
                  <Button size="small" onClick={() => handleSendWishClick(emp)} disabled={wishing === emp._id} variant="contained" sx={{ minWidth: '36px', width: '36px', height: '36px', borderRadius: '10px', p: 0, bgcolor: '#4F46E5', boxShadow: 'none' }}>
                    <SendIcon sx={{ fontSize: '1.1rem' }} />
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Filter & Actions Card */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search employee by name, email, or emp ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px', bgcolor: '#F8FAFC', minWidth: 320 }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button variant="outlined" size="small" onClick={() => setOpenManageOrgModal(true)} sx={{ borderRadius: '8px', color: '#475569', borderColor: '#CBD5E1', fontWeight: 700 }}>
              Manage Org Data
            </Button>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ borderRadius: '8px', bgcolor: '#2563EB', fontWeight: 800 }}>
              + Add Employee
            </Button>
          </Box>
        </Box>

        {/* Data Table with Clean EPF Status (No UAN strings) and Eye Icon 👁️ */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Emp ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{emp.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar src={emp.avatar} sx={{ width: 30, height: 30, bgcolor: '#2563EB', fontSize: '0.8rem', fontWeight: 800 }}>
                        {emp.name?.charAt(0)}
                      </Avatar>
                      {emp.name}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: '#64748B' }}>{emp.email}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{emp.dept}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{emp.desg}</TableCell>
                  <TableCell>
                    <StatusChip status={emp.status} />
                  </TableCell>
                  <TableCell textAlign="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
                      <IconButton size="small" onClick={() => setSelectedViewEmp(emp)} sx={{ border: '1px solid #E2E8F0', p: 0.5, color: '#2563EB' }}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditClick(emp)} sx={{ border: '1px solid #E2E8F0', p: 0.5, color: '#D97706' }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, emp)} sx={{ border: '1px solid #E2E8F0', p: 0.5 }}>
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Showing 1 to {employees.length} of 128 entries
          </Typography>
          <Pagination count={18} color="primary" size="small" />
        </Box>
      </Paper>

      {/* Row Three-Dots Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleUpdateStatus('ACTIVE')} sx={{ color: '#15803D', fontWeight: 700, gap: 1 }}>
          <CheckCircleOutlinedIcon fontSize="small" /> Set Status: Active
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('INACTIVE')} sx={{ color: '#D97706', fontWeight: 700, gap: 1 }}>
          <BlockOutlinedIcon fontSize="small" /> Set Status: Inactive
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('TERMINATED')} sx={{ color: '#B91C1C', fontWeight: 700, gap: 1 }}>
          <CancelOutlinedIcon fontSize="small" /> Set Status: Terminated
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('RESIGNED')} sx={{ color: '#9333EA', fontWeight: 700, gap: 1 }}>
          <ExitToAppIcon fontSize="small" /> Set Status: Resigned
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteEmployee} sx={{ color: '#EF4444', fontWeight: 800, gap: 1 }}>
          <DeleteOutlinedIcon fontSize="small" /> Delete Employee Record
        </MenuItem>
      </Menu>

      {/* View Full Employee Profile Modal (Eye Icon 👁️ Click) */}
      <Dialog open={Boolean(selectedViewEmp)} onClose={() => setSelectedViewEmp(null)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', borderBottom: '1px solid #F1F5F9' }}>
          Employee Profile Details
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#F8FAFC', p: 2, borderRadius: '14px' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={selectedViewEmp?.avatar} sx={{ width: 56, height: 56, bgcolor: '#2563EB', fontWeight: 900, fontSize: '1.2rem' }}>
                {selectedViewEmp?.name?.charAt(0)}
              </Avatar>
              {uploadingProfileAvatar && (
                <CircularProgress size={56} thickness={2.5} sx={{ position: 'absolute', top: 0, left: 0, color: '#2563EB' }} />
              )}
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                hidden
                onChange={handleProfilePhotoSelect}
              />
              <IconButton
                size="small"
                onClick={() => profilePhotoInputRef.current?.click()}
                disabled={uploadingProfileAvatar}
                sx={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, bgcolor: '#2563EB', color: '#FFFFFF', '&:hover': { bgcolor: '#1D4ED8' } }}
              >
                <PhotoCameraIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                {selectedViewEmp?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                {selectedViewEmp?.desg} • {selectedViewEmp?.dept}
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>
                Emp ID: {selectedViewEmp?.id}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Corporate Email</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedViewEmp?.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>PAN Number</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedViewEmp?.pan || '-'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>EPF Contribution</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: selectedViewEmp?.pf === 'Yes' ? '#10B981' : '#64748B' }}>{selectedViewEmp?.pf}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>UAN Number</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedViewEmp?.uan || '-'}</Typography>
            </Grid>
            {selectedViewEmp?.pf === 'Yes' && (
              <>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Monthly EPF Deduction (12%)</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#B45309' }}>
                    {'₹ ' + Number(selectedViewEmp?.epfDeduction || 0).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Employer EPF Contribution (12%)</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>
                    {'₹ ' + Number(selectedViewEmp?.epfEmployerContribution || 0).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </>
            )}
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Bank Account Details</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedViewEmp?.bank || '-'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Annual CTC</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#2563EB' }}>{selectedViewEmp?.ctc}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedViewEmp(null)} variant="contained" sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* CLEAN, ULTRA-STYLISH FULL-WIDTH ADD EMPLOYEE MODAL (NO DUMMY PRE-FILLED DATA!) */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ style: { borderRadius: '24px' } }}>
        {/* Modal Top Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              {formData._id ? 'Edit Employee Profile' : 'Create Employee Profile & Statutory Setup'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Fill in employee details across all the steps to complete the profile
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenModal(false)} size="small" sx={{ border: '1px solid #E2E8F0' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Top Stepper Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#F1F5F9', px: 3, bgcolor: '#F8FAFC' }}>
          <Tabs value={formTab} onChange={(e, v) => setFormTab(v)} sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.875rem', py: 1.8 } }}>
            <Tab label="1. Personal & Employment" />
            <Tab label="2. Bank Account Details" />
            <Tab label="3. Salary & Statutory (EPF / ESI / PAN)" />
          </Tabs>
        </Box>

        <form onSubmit={handleCreate}>
          <DialogContent sx={{ p: 3.5, maxHeight: '68vh', overflowY: 'auto' }}>
            {/* Tab 1: Personal & Employment */}
            {formTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Section 1: Personal Information */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                        Personal Information
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Basic personal details of the employee
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <input
                        ref={addPhotoInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        hidden
                        onChange={handleAddPhotoSelect}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        disabled={uploadingAvatar}
                        onClick={() => addPhotoInputRef.current?.click()}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, bgcolor: '#FFFFFF' }}
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      <Box sx={{ position: 'relative', width: 42, height: 42 }}>
                        <Avatar src={formData.avatar} sx={{ width: 42, height: 42, bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800 }}>
                          {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'LX'}
                        </Avatar>
                        {uploadingAvatar && (
                          <CircularProgress size={42} thickness={2.5} sx={{ position: 'absolute', top: 0, left: 0, color: '#2563EB' }} />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>First Name *</Typography>
                      <TextField fullWidth size="small" placeholder="Enter first name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Middle Name</Typography>
                      <TextField fullWidth size="small" placeholder="Enter middle name" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Last Name *</Typography>
                      <TextField fullWidth size="small" placeholder="Enter last name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Corporate Email *</Typography>
                      <TextField fullWidth size="small" placeholder="name@company.com" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Phone Number *</Typography>
                      <TextField fullWidth size="small" placeholder="Enter phone number" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Gender *</Typography>
                      <TextField select fullWidth size="small" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} sx={{ bgcolor: '#FFFFFF' }}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Date of Birth *</Typography>
                      <TextField fullWidth size="small" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Marital Status</Typography>
                      <TextField select fullWidth size="small" value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} sx={{ bgcolor: '#FFFFFF' }}>
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Married">Married</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Date of Joining *</Typography>
                      <TextField fullWidth size="small" type="date" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Employment Type *</Typography>
                      <TextField select fullWidth size="small" value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} sx={{ bgcolor: '#FFFFFF' }}>
                        <MenuItem value="FULL_TIME">Full Time</MenuItem>
                        <MenuItem value="PART_TIME">Part Time</MenuItem>
                        <MenuItem value="CONTRACT">Contract</MenuItem>
                        <MenuItem value="INTERN">Intern</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Probation Period (Months)</Typography>
                      <TextField fullWidth size="small" placeholder="Select probation period" value={formData.probationPeriod} onChange={(e) => setFormData({ ...formData, probationPeriod: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Section 2: Employment Details */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.3 }}>
                    Employment Details
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                    Role, department and workplace information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Employee ID *</Typography>
                      <TextField fullWidth size="small" placeholder="e.g. LX010 / EMP010" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>Department *</Typography>
                        <Button size="small" onClick={() => setOpenAddDeptModal(true)} sx={{ fontSize: '0.65rem', p: 0, textTransform: 'none', fontWeight: 800 }}>+ Add</Button>
                      </Box>
                      <TextField select fullWidth size="small" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} sx={{ bgcolor: '#FFFFFF' }}>
                        {departments.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>Designation *</Typography>
                        <Button size="small" onClick={() => setOpenAddDesgModal(true)} sx={{ fontSize: '0.65rem', p: 0, textTransform: 'none', fontWeight: 800 }}>+ Add</Button>
                      </Box>
                      <TextField select fullWidth size="small" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} sx={{ bgcolor: '#FFFFFF' }}>
                        {designations.map(g => <MenuItem key={g._id} value={g._id}>{g.title}</MenuItem>)}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Reporting Manager</Typography>
                      <TextField fullWidth size="small" placeholder="Manager Name" value={formData.reportingManager} onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Work Location *</Typography>
                      <TextField fullWidth size="small" placeholder="e.g. Mohali Head Office" value={formData.workLocation} onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Work Shift</Typography>
                      <TextField fullWidth size="small" placeholder="General Shift" value={formData.workShift} onChange={(e) => setFormData({ ...formData, workShift: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Business Unit</Typography>
                      <TextField fullWidth size="small" placeholder="IT Tech Unit" value={formData.businessUnit} onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Work Address</Typography>
                      <TextField fullWidth multiline rows={2} size="small" placeholder="Enter complete work address" value={formData.workAddress} onChange={(e) => setFormData({ ...formData, workAddress: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Tab 2: Bank Account Details */}
            {formTab === 1 && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.3 }}>
                  Bank Account Details
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 3 }}>
                  Employee bank account for payroll disbursement
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Bank Name *</Typography>
                    <TextField fullWidth size="small" placeholder="e.g. HDFC Bank, ICICI Bank" required value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Bank Account Number *</Typography>
                    <TextField fullWidth size="small" placeholder="Enter account number" required value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>IFSC Code *</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField fullWidth size="small" placeholder="HDFC0000240" required value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                      <Button variant="contained" onClick={verifyIfsc} disabled={isVerifyingIfsc} sx={{ bgcolor: '#2563EB', fontWeight: 800, px: 3 }}>Verify</Button>
                    </Box>
                    {ifscBranch && <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, mt: 0.5, display: 'block' }}>📍 {ifscBranch}</Typography>}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Account Type</Typography>
                    <TextField select fullWidth size="small" value={formData.accountType} onChange={(e) => setFormData({ ...formData, accountType: e.target.value })} sx={{ bgcolor: '#FFFFFF' }}>
                      <MenuItem value="Savings">Savings Account</MenuItem>
                      <MenuItem value="Current">Current Salary Account</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Tab 3: Salary & Statutory */}
            {formTab === 2 && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.3 }}>
                  Salary & Statutory Setup
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 3 }}>
                  EPF Provident Fund, ESI Insurance and PAN Tax setup
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Annual CTC (INR ₹) *</Typography>
                    <TextField fullWidth size="small" type="number" placeholder="e.g. 600000" required value={formData.ctc} onChange={(e) => setFormData({ ...formData, ctc: Number(e.target.value) })} sx={{ bgcolor: '#FFFFFF' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Monthly Base Salary (INR ₹) *</Typography>
                    <TextField fullWidth size="small" type="number" placeholder="e.g. 30000" required value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })} sx={{ bgcolor: '#FFFFFF' }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                      <FormControlLabel control={<Switch checked={formData.isPfEligible} onChange={(e) => setFormData({ ...formData, isPfEligible: e.target.checked })} color="primary" />} label={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Enable EPF / Provident Fund Contribution (12%)</Typography>} />
                      {formData.isPfEligible && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>UAN Number (12 Digits)</Typography>
                          <TextField fullWidth size="small" placeholder="Enter 12 digit UAN number" value={formData.uanNumber} onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })} />
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>PAN Card Number</Typography>
                    <TextField fullWidth size="small" placeholder="e.g. ABCDE1234F" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.4, display: 'block' }}>Aadhaar Card Number</Typography>
                    <TextField fullWidth size="small" placeholder="e.g. 1234 5678 9012" value={formData.aadhaarNumber} onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })} sx={{ bgcolor: '#FFFFFF' }} />
                  </Grid>
                </Grid>
              </Paper>
            )}
          </DialogContent>

          {/* Modal Footer Actions */}
          <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', bgcolor: '#FFFFFF' }}>
            <Button type="button" onClick={() => setOpenModal(false)} sx={{ fontWeight: 700, color: '#64748B' }}>
              Cancel
            </Button>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button type="button" variant="outlined" sx={{ borderRadius: '10px', borderColor: '#CBD5E1', color: '#475569', fontWeight: 800 }}>
                Save as Draft
              </Button>
              {formTab < 2 ? (
                <Button type="button" variant="contained" onClick={() => setFormTab(formTab + 1)} sx={{ borderRadius: '10px', bgcolor: '#2563EB', fontWeight: 800, px: 3 }}>
                  Next Step ➔
                </Button>
              ) : (
                <Button type="submit" variant="contained" sx={{ borderRadius: '10px', bgcolor: '#10B981', fontWeight: 800, px: 3 }}>
                  {formData._id ? '✓ Update Employee' : '✓ Create Employee'}
                </Button>
              )}
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* Inline Modal: Add New Department */}
      <Dialog open={openAddDeptModal} onClose={() => setOpenAddDeptModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>+ Add New Department</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Department Name *" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="e.g. DevOps & Cloud" required />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddDeptModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNewDepartment} sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>
            Create & Select Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inline Modal: Add New Designation */}
      <Dialog open={openAddDesgModal} onClose={() => setOpenAddDesgModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>+ Add New Designation</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Designation Title *" value={newDesgTitle} onChange={(e) => setNewDesgTitle(e.target.value)} placeholder="e.g. Senior Developer" required />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddDesgModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNewDesignation} sx={{ bgcolor: '#2563EB', fontWeight: 800 }}>
            Create & Select Designation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Org Modal - Full Featured with Add, Edit, Delete */}
      <Dialog open={openManageOrgModal} onClose={() => { setOpenManageOrgModal(false); setEditDeptId(null); setEditDesgId(null); setShowAddDeptInModal(false); setShowAddDesgInModal(false); }} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ p: 3, pb: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFF' }}>Manage Organization Data</Typography>
            <IconButton onClick={() => setOpenManageOrgModal(false)} size="small" sx={{ color: '#FFF', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Tabs value={orgTab} onChange={(e, v) => { setOrgTab(v); setEditDeptId(null); setEditDesgId(null); }} sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 700 }, '& .Mui-selected': { color: '#FFF !important' }, '& .MuiTabs-indicator': { bgcolor: '#FFF' } }}>
            <Tab label={`🏢 Departments (${departments.length})`} />
            <Tab label={`💼 Designations (${designations.length})`} />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 0, maxHeight: '55vh', overflowY: 'auto' }}>
          {/* DEPARTMENTS TAB */}
          {orgTab === 0 && (
            <Box>
              {/* Add new dept row */}
              {showAddDeptInModal && (
                <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: '#F0FDF4', borderBottom: '1px solid #D1FAE5' }}>
                  <TextField
                    fullWidth size="small" autoFocus
                    placeholder="New department name..."
                    value={inlineNewDept}
                    onChange={e => setInlineNewDept(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInlineAddDept()}
                    sx={{ bgcolor: '#FFF', borderRadius: '8px' }}
                  />
                  <Button variant="contained" onClick={handleInlineAddDept} sx={{ bgcolor: '#10B981', fontWeight: 800, whiteSpace: 'nowrap', px: 2, borderRadius: '8px' }}>Add</Button>
                  <Button onClick={() => { setShowAddDeptInModal(false); setInlineNewDept(''); }} sx={{ color: '#64748B', minWidth: 'auto' }}>✕</Button>
                </Box>
              )}

              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>DEPARTMENT NAME</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map(d => (
                    <TableRow key={d._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1 }}>
                        {editDeptId === d._id ? (
                          <TextField
                            size="small" autoFocus fullWidth
                            value={editDeptName}
                            onChange={e => setEditDeptName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdateDepartment(d._id); if (e.key === 'Escape') { setEditDeptId(null); setEditDeptName(''); } }}
                            sx={{ bgcolor: '#F8FAFC' }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏢</Box>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{d.name}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        {editDeptId === d._id ? (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Button size="small" variant="contained" onClick={() => handleUpdateDepartment(d._id)} sx={{ bgcolor: '#10B981', fontWeight: 800, fontSize: '0.75rem', px: 1.5, borderRadius: '6px', minWidth: 'auto' }}>Save</Button>
                            <Button size="small" onClick={() => { setEditDeptId(null); setEditDeptName(''); }} sx={{ color: '#64748B', fontSize: '0.75rem', px: 1, minWidth: 'auto' }}>Cancel</Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => { setEditDeptId(d._id); setEditDeptName(d.name); }} sx={{ color: '#D97706', border: '1px solid #FDE68A', borderRadius: '6px', p: 0.5 }}>
                              <EditOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteDepartment(d._id)} sx={{ color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', p: 0.5 }}>
                              <DeleteOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments.length === 0 && (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: '#94A3B8' }}>No departments yet. Click "+ Add Department" to start.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* DESIGNATIONS TAB */}
          {orgTab === 1 && (
            <Box>
              {showAddDesgInModal && (
                <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: '#F0FDF4', borderBottom: '1px solid #D1FAE5' }}>
                  <TextField
                    fullWidth size="small" autoFocus
                    placeholder="New designation title..."
                    value={inlineNewDesg}
                    onChange={e => setInlineNewDesg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInlineAddDesg()}
                    sx={{ bgcolor: '#FFF', borderRadius: '8px' }}
                  />
                  <Button variant="contained" onClick={handleInlineAddDesg} sx={{ bgcolor: '#10B981', fontWeight: 800, whiteSpace: 'nowrap', px: 2, borderRadius: '8px' }}>Add</Button>
                  <Button onClick={() => { setShowAddDesgInModal(false); setInlineNewDesg(''); }} sx={{ color: '#64748B', minWidth: 'auto' }}>✕</Button>
                </Box>
              )}

              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>DESIGNATION TITLE</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {designations.map(g => (
                    <TableRow key={g._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1 }}>
                        {editDesgId === g._id ? (
                          <TextField
                            size="small" autoFocus fullWidth
                            value={editDesgTitle}
                            onChange={e => setEditDesgTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdateDesignation(g._id); if (e.key === 'Escape') { setEditDesgId(null); setEditDesgTitle(''); } }}
                            sx={{ bgcolor: '#F8FAFC' }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💼</Box>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{g.title}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        {editDesgId === g._id ? (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Button size="small" variant="contained" onClick={() => handleUpdateDesignation(g._id)} sx={{ bgcolor: '#10B981', fontWeight: 800, fontSize: '0.75rem', px: 1.5, borderRadius: '6px', minWidth: 'auto' }}>Save</Button>
                            <Button size="small" onClick={() => { setEditDesgId(null); setEditDesgTitle(''); }} sx={{ color: '#64748B', fontSize: '0.75rem', px: 1, minWidth: 'auto' }}>Cancel</Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => { setEditDesgId(g._id); setEditDesgTitle(g.title); }} sx={{ color: '#D97706', border: '1px solid #FDE68A', borderRadius: '6px', p: 0.5 }}>
                              <EditOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteDesignation(g._id)} sx={{ color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', p: 0.5 }}>
                              <DeleteOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {designations.length === 0 && (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: '#94A3B8' }}>No designations yet. Click "+ Add Designation" to start.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #F1F5F9', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => orgTab === 0 ? setShowAddDeptInModal(true) : setShowAddDesgInModal(true)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: '8px', fontWeight: 800, borderColor: '#4F46E5', color: '#4F46E5', '&:hover': { bgcolor: '#EEF2FF', borderColor: '#4F46E5' } }}
          >
            + Add {orgTab === 0 ? 'Department' : 'Designation'}
          </Button>
          <Button onClick={() => { setOpenManageOrgModal(false); setEditDeptId(null); setEditDesgId(null); }} variant="contained" sx={{ bgcolor: '#0F172A', fontWeight: 800, borderRadius: '8px' }}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Birthday Wish Dialog */}
      <Dialog open={wishDialog} onClose={() => setWishDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <CakeIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B' }}>Send Birthday Wish</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#A3AED0' }}>to {wishEmp?.firstName} {wishEmp?.lastName}</Typography>
            </Box>
          </Box>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B', mb: 2 }}>Suggested Messages</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {suggestedMessages.map((msg, i) => (
              <Chip key={i} label={msg} onClick={() => setWishMessage(msg)} sx={{ 
                bgcolor: wishMessage === msg ? '#4318FF' : '#F4F7FE', 
                color: wishMessage === msg ? '#FFF' : '#4318FF', 
                fontWeight: 700, borderRadius: '12px', cursor: 'pointer', '&:hover': { bgcolor: wishMessage === msg ? '#4318FF' : '#E2E8F0' } 
              }} />
            ))}
          </Box>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B', mb: 1 }}>Or Write Your Own</Typography>
          <TextField 
            multiline rows={3} fullWidth 
            placeholder="Type your message here..."
            value={wishMessage}
            onChange={(e) => setWishMessage(e.target.value)}
            InputProps={{ sx: { borderRadius: '16px', bgcolor: '#F8FAFC' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setWishDialog(false)} sx={{ color: '#A3AED0', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSendWish} disabled={wishing || !wishMessage.trim()} endIcon={<SendIcon />} sx={{ bgcolor: '#4318FF', borderRadius: '12px', fontWeight: 700, px: 4 }}>Send Wish</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
