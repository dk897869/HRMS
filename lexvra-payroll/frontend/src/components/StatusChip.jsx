import React from 'react';
import { Chip, Box } from '@mui/material';

const statusConfig = {
  PRESENT: { label: 'Present', bg: '#DCFCE7', color: '#15803D', dot: '#10B981' },
  WORKING: { label: 'Working', bg: '#DCFCE7', color: '#15803D', dot: '#10B981' },
  LATE: { label: 'Late Punch', bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
  ABSENT: { label: 'Absent', bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' },
  NOT_IN_YET: { label: 'Not In Yet', bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' },
  ON_LEAVE: { label: 'Time Off', bg: '#F3E8FF', color: '#7E22CE', dot: '#9333EA' },
  TIME_OFF: { label: 'Time Off', bg: '#F3E8FF', color: '#7E22CE', dot: '#9333EA' },
  HALF_DAY: { label: 'Half Day', bg: '#EFF6FF', color: '#1D4ED8', dot: '#2563EB' },
  WEEK_OFF: { label: 'Week Off', bg: '#F1F5F9', color: '#475569', dot: '#64748B' },
  ACTIVE: { label: 'Active', bg: '#DCFCE7', color: '#15803D', dot: '#10B981' },
  INACTIVE: { label: 'Inactive', bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  PENDING: { label: 'Pending', bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
  APPROVED: { label: 'Approved', bg: '#DCFCE7', color: '#15803D', dot: '#10B981' },
  REJECTED: { label: 'Rejected', bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' },
  PROCESSING: { label: 'Processing', bg: '#E0F2FE', color: '#0369A1', dot: '#0284C7' },
  PAID: { label: 'Paid', bg: '#DCFCE7', color: '#15803D', dot: '#10B981' }
};

const StatusChip = ({ status }) => {
  const config = statusConfig[status] || { label: status, bg: '#F1F5F9', color: '#475569', dot: '#64748B' };

  return (
    <Chip
      avatar={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: config.dot, ml: 1 }} />}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 800,
        fontSize: '0.725rem',
        borderRadius: '8px',
        height: '24px',
        border: '1px solid rgba(0,0,0,0.04)'
      }}
    />
  );
};

export default StatusChip;
