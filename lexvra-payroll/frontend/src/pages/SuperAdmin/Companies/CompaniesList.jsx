import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Avatar, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoginIcon from '@mui/icons-material/Login';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useSelector(state => state.superAdminAuth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axiosClient.get('/superadmin/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setCompanies(res.companies);
      }
    } catch (err) {
      toast.error('Failed to fetch companies');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return { bg: '#ECFDF5', color: '#10B981' };
      case 'Trial': return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'Expired': return { bg: '#FEF2F2', color: '#EF4444' };
      case 'Suspended': return { bg: '#F1F5F9', color: '#475569' };
      default: return { bg: '#F8FAFC', color: '#94A3B8' };
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Companies</Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>Manage all registered tenants on the platform.</Typography>
        </Box>
        <Button variant="contained" sx={{ bgcolor: '#4318FF', color: '#fff', borderRadius: '12px', px: 3, py: 1.5, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#3311DB' } }}>
          Add Company
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 0, borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#fff', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search companies by name or email..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 350, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
            }}
          />
          <Typography variant="subtitle2" sx={{ color: '#64748B', fontWeight: 600 }}>Total: {filteredCompanies.length}</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', py: 2 }}>Company Info</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', py: 2 }}>Employees</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', py: 2 }}>Joined Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((company) => {
                const statusColor = getStatusColor(company.subscriptionStatus);
                return (
                  <TableRow key={company._id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={company.logoUrl} sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 800 }}>
                          {company.companyName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{company.companyName}</Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>{company.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{company.employeesUsed}</Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>/ {company.employeeLimit}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={company.subscriptionStatus} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.color, fontWeight: 800 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontWeight: 500 }}>
                      {new Date(company.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton size="small" onClick={() => navigate(`/super-admin/companies/${company._id}`)} sx={{ color: '#4318FF', bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' }, borderRadius: '8px' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#10B981', bgcolor: '#ECFDF5', '&:hover': { bgcolor: '#D1FAE5' }, borderRadius: '8px' }} title="Login As Company">
                          <LoginIcon fontSize="small" />
                        </IconButton>
                        {company.subscriptionStatus === 'Suspended' ? (
                          <IconButton size="small" sx={{ color: '#F59E0B', bgcolor: '#FEF3C7', '&:hover': { bgcolor: '#FDE68A' }, borderRadius: '8px' }} title="Activate">
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton size="small" sx={{ color: '#EF4444', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' }, borderRadius: '8px' }} title="Suspend">
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748B' }}>
                    No companies found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CompaniesList;
