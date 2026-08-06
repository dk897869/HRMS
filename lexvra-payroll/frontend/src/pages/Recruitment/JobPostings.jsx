import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import axiosClient from '../../api/axiosClient';

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axiosClient.get('/recruitment/jobs');
      if (res.success && res.data.length > 0) setJobs(res.data);
      else {
        setJobs([
          { _id: '1', title: 'Senior Full Stack Engineer', location: 'Mohali HQ', type: 'FULL_TIME', openings: 3, status: 'OPEN' },
          { _id: '2', title: 'BDE - Enterprise Sales', location: 'Mohali HQ', type: 'FULL_TIME', openings: 5, status: 'OPEN' },
          { _id: '3', title: 'HR Operations Executive', location: 'Mohali HQ', type: 'FULL_TIME', openings: 1, status: 'OPEN' }
        ]);
      }
    } catch (err) {
      console.log('Using sample job postings');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Recruitment & Applicant Tracking (ATS)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage active job requisitions, candidate sourcing pipeline, and offer letters
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: '10px' }}>Post New Job</Button>
      </Box>

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job._id}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Chip label={job.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                <Typography variant="caption" sx={{ color: '#64748B' }}>{job.openings} Openings</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0B47A9', mb: 1 }}>{job.title}</Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>{job.location} • {job.type}</Typography>
              <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: '8px' }}>View Applicants</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default JobPostings;
