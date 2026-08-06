import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Avatar, Skeleton, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DevicesIcon from '@mui/icons-material/Devices';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

const AssetsList = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [value, setValue] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, empRes] = await Promise.all([
        axiosClient.get('/assets').catch(() => null),
        axiosClient.get('/employees').catch(() => null)
      ]);

      const assetData = assetsRes?.data || assetsRes?.assets || assetsRes || [];
      const empData = Array.isArray(empRes) ? empRes : (empRes?.data || empRes?.employees || []);

      setAssets(Array.isArray(assetData) ? assetData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      toast.error('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Asset Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        assetCode: assetCode.trim() || `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        category,
        serialNumber: serialNumber.trim(),
        value: parseFloat(value) || 0,
        condition,
        assignedTo: assignedTo || null,
        status: assignedTo ? 'ASSIGNED' : 'AVAILABLE'
      };

      await axiosClient.post('/assets', payload);
      toast.success(`Asset "${name}" created successfully!`);
      setOpenModal(false);
      setName('');
      setAssetCode('');
      setSerialNumber('');
      setValue('');
      setAssignedTo('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Title & Add Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            Hardware & Office Assets Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Track laptop, desktop, peripherals allocation, serial numbers, and employee assignments
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#4F46E5', color: '#FFF', borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, py: 1.2, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', '&:hover': { bgcolor: '#4338CA' } }}
        >
          Add Asset
        </Button>
      </Box>

      {/* Main Assets Table */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>ASSET NAME</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>ASSET TAG CODE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>ASSIGNED EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>CONDITION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton height={40} /></TableCell>
                  </TableRow>
                ))
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <DevicesIcon sx={{ fontSize: '2.5rem', opacity: 0.5, mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: '#475569' }}>No hardware assets registered yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((a) => {
                  const emp = a.assignedTo || {};
                  return (
                    <TableRow key={a._id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell sx={{ fontWeight: 800, color: '#4F46E5', fontSize: '0.9rem' }}>
                        {a.name}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                        {a.assetCode || a.code || 'AST-001'}
                      </TableCell>

                      <TableCell>
                        <Chip label={a.category || 'Laptop'} size="small" sx={{ fontWeight: 800, bgcolor: '#F5F3FF', color: '#8B5CF6', borderRadius: '8px' }} />
                      </TableCell>

                      <TableCell>
                        {emp.firstName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={emp.avatar} sx={{ width: 32, height: 32, bgcolor: '#2563EB', fontWeight: 800, fontSize: '0.75rem' }}>
                              {emp.firstName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                                {emp.firstName} {emp.lastName}
                              </Typography>
                              <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>
                                {emp.employeeId || 'LX001'}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip label={a.condition || 'GOOD'} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={a.status || 'AVAILABLE'}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            bgcolor: a.status === 'ASSIGNED' ? '#DCFCE7' : '#FEF3C7',
                            color: a.status === 'ASSIGNED' ? '#15803D' : '#D97706',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD ASSET MODAL DIALOG */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          💻 Register New Asset
        </DialogTitle>
        <form onSubmit={handleCreateAsset}>
          <DialogContent sx={{ pt: 2.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Asset Name <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g. MacBook Pro 16 M2 Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Asset Tag Code
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. AST-MBP-01"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Category <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                >
                  {['Laptop', 'Desktop', 'Mobile', 'Monitor', 'Furniture', 'Peripheral', 'Other'].map(cat => (
                    <MenuItem key={cat} value={cat} sx={{ fontWeight: 600 }}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Serial Number
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. C02G901XMD6N"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  Asset Value (₹)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 150000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                Assign to Employee (Dynamic Employee Selection)
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              >
                <MenuItem value="" sx={{ fontWeight: 600, color: '#94A3B8' }}>-- Unassigned / Available --</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp._id} value={emp._id} sx={{ fontWeight: 600 }}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId || 'LX001'}) - {emp.department?.name || 'Staff'}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#4F46E5', color: '#FFF', fontWeight: 800, borderRadius: '10px', textTransform: 'none', px: 3 }}>
              {submitting ? 'Creating...' : 'Register Asset'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AssetsList;
