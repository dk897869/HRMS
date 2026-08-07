import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Button, Paper, Chip, Avatar, Dialog, DialogTitle, DialogContent, IconButton,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarIcon from '@mui/icons-material/Star';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';

import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SubscriptionPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState('Free Trial');
  const [subscriptionStart, setSubscriptionStart] = useState(new Date().toISOString());
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString());
  const [companySettings, setCompanySettings] = useState(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [recentPayment, setRecentPayment] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings');
      if (res.data) {
        setCompanySettings(res.data);
        if (res.data.subscriptionPlan) setCurrentPlan(res.data.subscriptionPlan);
        if (res.data.subscriptionExpiry) setSubscriptionExpiry(res.data.subscriptionExpiry);
        if (res.data.trialStartDate) setSubscriptionStart(res.data.trialStartDate);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const getAmountFromPlan = (plan) => {
    if (plan.includes('399') || plan.includes('Monthly')) return 399;
    if (plan.includes('100')) return 7999;
    if (plan === 'Free Trial') return 0;
    return 4999;
  };

  // Generate Mock Transactions based on current plan
  const transactions = currentPlan !== 'Free Trial' ? [
    { id: 'TXN-984371', date: subscriptionStart, plan: currentPlan, amount: getAmountFromPlan(currentPlan), status: 'Paid' },
  ] : [];

  const handleCheckout = async (planName, amount) => {
    setIsProcessing(true);
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    try {
      const orderData = await axiosClient.post('/payment/create-order', { amount, plan: planName });
      if (!orderData || !orderData.success) {
        toast.error('Failed to create order');
        return;
      }

      const options = {
        key: 'rzp_test_TEwpOxhGVvjjNK',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: companySettings?.companyName || 'PayFlexPayroll SaaS',
        description: `Upgrade to ${planName}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axiosClient.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName
            });

            if (verifyRes && verifyRes.success) {
              setRecentPayment({
                planName,
                amount,
                id: response.razorpay_payment_id,
                date: new Date().toISOString()
              });
              setSuccessModalOpen(true);
            }
          } catch (err) {
            toast.error('Payment Verification Failed!');
          }
        },
        prefill: {
          name: 'Admin User',
          email: companySettings?.companyEmail || 'admin@payflexpayroll.com',
          contact: companySettings?.companyPhone || '9999999999'
        },
        theme: { color: '#4318FF' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadInvoice = (txn) => {
    generateInvoicePDF(companySettings, {
      name: txn.plan,
      start: txn.date,
      expiry: subscriptionExpiry,
      amount: txn.amount
    }, { invoiceNumber: txn.id });
  };

  const handleManageCancel = () => {
    toast('Subscription cancelled. You will have access until the end of your billing cycle.', { icon: '✅' });
    setCurrentPlan('Free Trial');
  };

  // Progress Bar Logic
  const calculateProgress = () => {
    const start = new Date(subscriptionStart).getTime();
    const end = new Date(subscriptionExpiry).getTime();
    const now = new Date().getTime();
    if (now > end) return 100;
    if (now < start) return 0;
    return ((now - start) / (end - start)) * 100;
  };
  
  const getDaysLeft = () => {
    const end = new Date(subscriptionExpiry).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return diff > 0 ? Math.ceil(diff / (1000 * 3600 * 24)) : 0;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* SaaS Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Billing & Subscription</Typography>
        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>Manage your plans, billing history, and invoices.</Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: '#fff', '& .MuiTab-root': { py: 3, fontWeight: 700, fontSize: '1rem', textTransform: 'none', color: '#64748B' }, '& .Mui-selected': { color: '#4318FF' } }}
        >
          <Tab label="Overview" />
          <Tab label="Billing & Invoices" />
          <Tab label="Upgrade Plan" />
        </Tabs>

        {/* TAB 1: OVERVIEW */}
        {tabIndex === 0 && (
          <Box sx={{ p: 4, bgcolor: '#fff' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Active Plan</Typography>
                    {currentPlan !== 'Free Trial' ? (
                      <Chip label="Active" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 800 }} />
                    ) : (
                      <Chip label="Trial" sx={{ bgcolor: '#FEF2F2', color: '#EF4444', fontWeight: 800 }} />
                    )}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#4318FF', mb: 1 }}>{currentPlan}</Typography>
                  <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>
                    {currentPlan === 'Free Trial' ? 'Explore all premium HR and Payroll features free for 7 days.' : 'You have access to all premium features.'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 700 }}>Billing Cycle Progress</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#4318FF', fontWeight: 800 }}>{getDaysLeft()} days left</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 10, borderRadius: 5, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#4318FF' }, mb: 4 }} />
                  
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Active From</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>{new Date(subscriptionStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Valid Until (Expiry)</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>{new Date(subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 3 }}>Manage Subscription</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    <Button onClick={() => setTabIndex(2)} variant="contained" sx={{ bgcolor: '#4318FF', color: '#fff', py: 1.5, borderRadius: '12px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#3311DB' } }}>
                      Change or Upgrade Plan
                    </Button>
                    {currentPlan !== 'Free Trial' && (
                      <Button onClick={handleManageCancel} variant="outlined" sx={{ color: '#EF4444', borderColor: '#EF4444', py: 1.5, borderRadius: '12px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#FEF2F2', borderColor: '#EF4444' } }}>
                        Cancel Subscription
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ mt: 4, p: 2, bgcolor: '#EEF2FF', borderRadius: '12px', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <VerifiedUserOutlinedIcon sx={{ color: '#4318FF' }} />
                    <Typography variant="caption" sx={{ color: '#1B254B', fontWeight: 600 }}>Your payment data is securely managed by Razorpay.</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: BILLING & INVOICES */}
        {tabIndex === 1 && (
          <Box sx={{ p: 4, bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Transaction History</Typography>
              <Button variant="outlined" startIcon={<ReceiptLongIcon />} sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, color: '#64748B', borderColor: '#E2E8F0' }}>
                Download All
              </Button>
            </Box>

            {transactions.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '16px' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Invoice ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Plan</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((txn, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{txn.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>{new Date(txn.date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{txn.plan}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>₹{txn.amount}</TableCell>
                        <TableCell>
                          <Chip label={txn.status} size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 800 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Button onClick={() => downloadInvoice(txn)} size="small" startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700, color: '#4318FF' }}>
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                <ReceiptLongIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 800 }}>No Transactions Yet</Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>You are currently on a free trial. Upgrade to see your billing history.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* TAB 3: UPGRADE PLAN */}
        {tabIndex === 2 && (
          <Box sx={{ p: 4, bgcolor: '#F4F7FE' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B', mb: 1 }}>Upgrade your workplace</Typography>
              <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>Unlock advanced features and scale your business effortlessly.</Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              
              {/* Monthly Plan */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B', mb: 1 }}>Monthly Plan</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B254B' }}>₹399</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>/ month</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 4, minHeight: 40 }}>Perfect for small teams starting out.</Typography>
                  
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {['Up to 20 Employees', 'Basic Payroll', 'Standard Support', 'Core HR Features'].map((feat, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ color: '#4318FF', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 600 }}>{feat}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button onClick={() => handleCheckout('Monthly Plan', 399)} disabled={isProcessing} variant="outlined" fullWidth sx={{ py: 1.5, borderRadius: '12px', borderColor: '#E2E8F0', color: '#4318FF', fontWeight: 800, textTransform: 'none' }}>
                    {isProcessing ? 'Processing...' : 'Choose Plan'}
                  </Button>
                </Paper>
              </Grid>

              {/* Yearly Plan (Best Value) */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ position: 'relative', p: 4, borderRadius: '24px', border: '2px solid #10B981', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                  <Chip icon={<StarIcon sx={{ fontSize: '14px !important' }}/>} label="Best Value" sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', bgcolor: '#10B981', color: '#fff', fontWeight: 800 }} />
                  
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B', mb: 1 }}>Yearly Plan</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B254B' }}>₹4,999</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>/ year</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 700, mb: 4, minHeight: 40 }}>Save ₹989 (17%) billed annually.</Typography>
                  
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {['Up to 50 Employees', 'Advanced Payroll', 'Priority Support', 'Full HR & Analytics', 'Dedicated Account Manager'].map((feat, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 600 }}>{feat}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button onClick={() => handleCheckout('Yearly Plan - 50 Employees', 4999)} disabled={isProcessing} variant="contained" fullWidth sx={{ py: 1.5, borderRadius: '12px', bgcolor: '#10B981', color: '#FFFFFF', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}>
                    {isProcessing ? 'Processing...' : 'Choose Plan'}
                  </Button>
                </Paper>
              </Grid>

              {/* Enterprise Plan */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B254B', mb: 1 }}>Enterprise Plan</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B254B' }}>₹7,999</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>/ year</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 700, mb: 4, minHeight: 40 }}>Save ₹2,999 (30%) billed annually.</Typography>
                  
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {['Up to 100 Employees', 'Advanced Payroll', 'Priority Support', 'Full HR & Analytics', 'Dedicated Account Manager', 'Role-based Access Control'].map((feat, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#1B254B', fontWeight: 600 }}>{feat}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button onClick={() => handleCheckout('Yearly Plan - 100 Employees', 7999)} disabled={isProcessing} variant="outlined" fullWidth sx={{ py: 1.5, borderRadius: '12px', borderColor: '#E2E8F0', color: '#1B254B', fontWeight: 800, textTransform: 'none' }}>
                    {isProcessing ? 'Processing...' : 'Choose Plan'}
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Success Dialog */}
      <Dialog open={successModalOpen} onClose={() => { setSuccessModalOpen(false); window.location.reload(); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1B254B' }}></Typography>
          <IconButton onClick={() => { setSuccessModalOpen(false); window.location.reload(); }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: '#10B981', width: 80, height: 80, mx: 'auto', mb: 3 }}><CheckCircleIcon sx={{ fontSize: 50, color: '#fff' }} /></Avatar>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B254B', mb: 1 }}>Payment Successful!</Typography>
          <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>Thank you for upgrading to <b>{recentPayment?.planName}</b>. Your account has been upgraded successfully.</Typography>
          
          <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: '16px', textAlign: 'left', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" sx={{ color: '#64748B' }}>Amount Paid</Typography><Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>₹{recentPayment?.amount?.toLocaleString()}</Typography></Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" sx={{ color: '#64748B' }}>Transaction ID</Typography><Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{recentPayment?.id}</Typography></Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" sx={{ color: '#64748B' }}>Date</Typography><Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B254B' }}>{new Date().toLocaleDateString()}</Typography></Box>
          </Box>
          <Button onClick={() => { setSuccessModalOpen(false); window.location.reload(); }} variant="contained" fullWidth sx={{ py: 1.5, borderRadius: '12px', bgcolor: '#4318FF', fontWeight: 800, textTransform: 'none' }}>Continue to Dashboard</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPage;
