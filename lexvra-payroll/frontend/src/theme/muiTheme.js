import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#DBEAFE',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6366F1',
      light: '#EEF2FF',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    success: {
      main: '#10B981',
      light: '#ECFDF5',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FFFBEB',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#6366F1',
      light: '#EEF2FF',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.01em', lineHeight: 1.2 },
    h3: { fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.3 },
    h4: { fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3 },
    h5: { fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4 },
    h6: { fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.4 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6, color: '#334155' },
    body2: { fontSize: '0.8rem', lineHeight: 1.5, color: '#475569' },
    subtitle1: { fontWeight: 700, fontSize: '0.9rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.82rem' },
    caption: { fontSize: '0.72rem', color: '#64748B', lineHeight: 1.5 },
    overline: { fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.2px' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    '0 4px 10px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
    '0 6px 14px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
    '0 8px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
    '0 10px 25px rgba(0,0,0,0.09)',
    '0 12px 30px rgba(0,0,0,0.09)',
    '0 14px 35px rgba(0,0,0,0.09)',
    '0 16px 40px rgba(0,0,0,0.10)',
    '0 18px 45px rgba(0,0,0,0.10)',
    '0 20px 50px rgba(0,0,0,0.10)',
    ...Array(13).fill('0 24px 60px rgba(0,0,0,0.12)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6FA',
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.82rem',
          padding: '7px 18px',
          transition: 'all 0.18s ease',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
          '&:hover': { boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)' },
        },
        outlinedPrimary: {
          borderColor: '#BFDBFE',
          '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #E2E8F0',
        },
        elevation0: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            fontSize: '0.82rem',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
            '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root': { fontSize: '0.82rem' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#F8FAFC',
          fontSize: '0.82rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.7rem',
        },
        sizeSmall: {
          height: 22,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '10px 14px',
          fontSize: '0.8rem',
        },
        head: {
          backgroundColor: '#F8FAFC',
          color: '#64748B',
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#F8FAFC' },
          '&:last-child td': { borderBottom: 'none' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#F1F5F9' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          fontSize: '1rem',
          color: '#0F172A',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          fontSize: '0.72rem',
          borderRadius: 8,
          padding: '5px 10px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          fontSize: '0.82rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.82rem',
          minWidth: 'auto',
          padding: '8px 14px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2.5,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #2563EB, #6366F1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.82rem',
          fontWeight: 600,
          margin: '1px 0',
          '&:hover': { backgroundColor: '#F8FAFC' },
          '&.Mui-selected': { backgroundColor: '#EFF6FF', color: '#2563EB' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 10, backgroundColor: '#F1F5F9', height: 6 },
        bar: { borderRadius: 10 },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '0.6rem',
          minWidth: 16,
          height: 16,
          fontWeight: 800,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: { '& .MuiPaginationItem-root': { borderRadius: 8, fontWeight: 700, fontSize: '0.78rem' } },
      },
    },
  },
});

export default theme;
