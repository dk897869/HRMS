import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const modules = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees Directory' },
  { key: 'attendance', label: 'Attendance & Punches' },
  { key: 'leaves', label: 'Leave Management' },
  { key: 'payroll', label: 'Payroll & Payslips' },
  { key: 'recruitment', label: 'Recruitment (ATS)' },
  { key: 'performance', label: 'Performance Reviews' },
  { key: 'claims', label: 'Claims & Expenses' },
  { key: 'assets', label: 'Asset Management' },
  { key: 'documents', label: 'Document Vault' },
  { key: 'reports', label: 'Reports & Export' },
  { key: 'settings', label: 'System Settings' }
];

const actions = ['read', 'create', 'update', 'delete', 'approve', 'export'];

const RolePermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosClient.get('/roles');
      if (res.success && res.data.length > 0) {
        setRoles(res.data);
        setSelectedRole(res.data[0]);
        setPermissions(res.data[0].permissions || {});
      }
    } catch (err) {
      console.log('Error fetching roles');
    }
  };

  const handleRoleChange = (roleId) => {
    const role = roles.find((r) => r._id === roleId);
    if (role) {
      setSelectedRole(role);
      setPermissions(role.permissions || {});
    }
  };

  const handleCheckboxToggle = (moduleKey, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [action]: !prev[moduleKey]?.[action]
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      const res = await axiosClient.put(`/roles/${selectedRole._id}/permissions`, { permissions });
      if (res.success) {
        toast.success(`Dynamic permissions saved for ${selectedRole.displayName}!`);
        fetchRoles();
      }
    } catch (err) {
      toast.error('Failed to update permissions');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Role-Based Access Control (RBAC)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage dynamic module-level access permissions across system roles
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: '10px', px: 3 }}>
          Save Permission Matrix
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Box sx={{ mb: 3, maxWidth: 300 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Target Role</InputLabel>
            <Select
              value={selectedRole?._id || ''}
              label="Select Target Role"
              onChange={(e) => handleRoleChange(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              {roles.map((r) => (
                <MenuItem key={r._id} value={r._id}>{r.displayName} ({r.name})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Module Name</TableCell>
                {actions.map((act) => (
                  <TableCell key={act} align="center" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                    {act}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((m) => (
                <TableRow key={m.key} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{m.label}</TableCell>
                  {actions.map((act) => (
                    <TableCell key={act} align="center">
                      <Checkbox
                        checked={!!permissions[m.key]?.[act]}
                        onChange={() => handleCheckboxToggle(m.key, act)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RolePermissionManagement;
