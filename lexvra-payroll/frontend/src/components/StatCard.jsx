import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  iconBg = '#F3E8FF',
  iconColor = '#8B5CF6',
  chartColor = '#8B5CF6',
  sparklineData = [
    { v: 10 }, { v: 15 }, { v: 12 }, { v: 25 }, { v: 18 }, { v: 30 }, { v: 22 }, { v: 35 }
  ]
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        borderRadius: '18px',
        bgcolor: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px rgba(11, 71, 169, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: iconBg, color: iconColor, width: 42, height: 42, borderRadius: '12px' }}>
            {Icon && <Icon fontSize="small" />}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </Box>

      {trendValue && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, my: 1 }}>
          {trend === 'up' && <TrendingUpIcon sx={{ color: '#10B981', fontSize: 14 }} />}
          {trend === 'down' && <TrendingDownIcon sx={{ color: '#EF4444', fontSize: 14 }} />}
          {trend === 'neutral' && <RemoveIcon sx={{ color: '#94A3B8', fontSize: 14 }} />}

          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#64748B',
            }}
          >
            {trendValue}
          </Typography>
        </Box>
      )}

      {/* Sparkline Wave Chart */}
      <Box sx={{ height: 35, width: '100%', mt: 0.5, ml: -1, mr: -1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`grad_${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={chartColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#grad_${title.replace(/\s+/g, '')})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default StatCard;
