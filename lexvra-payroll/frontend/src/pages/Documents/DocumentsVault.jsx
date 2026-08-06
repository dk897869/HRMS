import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axiosClient from '../../api/axiosClient';

const DocumentsVault = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { title: 'Company Policies & Handbook', count: documents.filter(d => d.category === 'Company Policy').length },
    { title: 'Offer Letters & Employment Contracts', count: documents.filter(d => d.category === 'Offer Letter' || d.category === 'Contract').length },
    { title: 'Tax Declarations (Form 16 / IT)', count: documents.filter(d => d.category === 'Tax Document').length },
    { title: 'Identity & Statutory Proofs (PAN/Aadhaar)', count: documents.filter(d => d.category === 'Identity').length },
    { title: 'Certificates & Awards', count: documents.filter(d => d.category === 'Certificate').length },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/documents');
      setDocuments(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl) => {
    let fullUrl = fileUrl;
    if (!fileUrl.startsWith('http')) {
      fullUrl = `${import.meta.env.VITE_SOCKET_URL || 'https://lx-hrms-1.onrender.com'}${fileUrl}`;
    }
    window.open(fullUrl, '_blank');
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Enterprise Documents Vault
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Secure document management system for policy compliance, contracts, certificates, and tax proofs
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<UploadFileIcon />} sx={{ borderRadius: '10px', bgcolor: '#2563EB', fontWeight: 700 }}>Upload Document</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {categories.map((c, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { borderColor: '#CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#EFF6FF', color: '#0B47A9' }}>
                <FolderIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2, mb: 0.5 }}>{c.title}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{c.count} Files stored</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 0, borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>My Documents & Certificates</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2 }}>Document Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2 }}>Date Added</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <Typography sx={{ fontWeight: 600 }}>No documents found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: doc.category === 'Certificate' ? '#FEF3C7' : '#F1F5F9', color: doc.category === 'Certificate' ? '#D97706' : '#475569' }}>
                           <InsertDriveFileIcon fontSize="small" />
                        </Box>
                        {doc.title}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip label={doc.category} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#F1F5F9', color: '#475569', borderRadius: '6px' }} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontWeight: 600, py: 2 }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 2 }}>
                      <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleDownload(doc.fileUrl)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: '#2563EB', borderColor: '#BFDBFE', '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' } }}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DocumentsVault;
