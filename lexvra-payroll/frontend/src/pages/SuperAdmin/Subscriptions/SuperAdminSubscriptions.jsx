import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tabs, Tab, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const SuperAdminSubscriptions = () => {
  const [companies, setCompanies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const { token } = useSelector(state => state.superAdminAuth);

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const fetchSubscriptionsData = async () => {
    try {
      const res = await axiosClient.get('/superadmin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setCompanies(res.companies);
        setInvoices(res.invoices);
      }
    } catch (err) {
      toast.error('Failed to load subscriptions data');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return { bg: '#ECFDF5', color: '#10B981' };
      case 'Trial': return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'Expired': return { bg: '#FEF2F2', color: '#EF4444' };
      case 'Paid': return { bg: '#ECFDF5', color: '#10B981' };
      case 'Pending': return { bg: '#FEF3C7', color: '#F59E0B' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Billing & Subscriptions</Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>Monitor all active plans and recent transactions.</Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', bgcolor: '#fff', overflow: 'hidden' }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ borderBottom: '1px solid #E2E8F0', px: 2, pt: 1, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}>
          <Tab label="Active Subscriptions" />
          <Tab label="All Invoices" />
        </Tabs>
        
        {/* Subscriptions Tab */}
        {tabIndex === 0 && (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Company Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Employees (Used/Limit)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Joined Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => {
                  const colors = getStatusColor(company.subscriptionStatus);
                  return (
                    <TableRow key={company._id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>{company.companyName}</TableCell>
                      <TableCell>
                        <Chip label={company.subscriptionStatus} size="small" sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 800 }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{company.employeesUsed} / {company.employeeLimit}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontWeight: 500 }}>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
                {companies.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748B' }}>No subscriptions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Invoices Tab */}
        {tabIndex === 1 && (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Invoice ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => {
                  const colors = getStatusColor(inv.status);
                  return (
                    <TableRow key={inv._id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>{inv.invoiceNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>{inv.companyId?.companyName || 'Unknown'}</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: '#0F172A' }}>₹{inv.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={inv.status} size="small" sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 800 }} />
                      </TableCell>
                      <TableCell sx={{ color: '#64748B', fontWeight: 500 }}>{new Date(inv.paidDate || inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 800, color: '#4318FF' }}>Download</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748B' }}>No invoices found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </Paper>
    </Box>
  );
};

export default SuperAdminSubscriptions;
