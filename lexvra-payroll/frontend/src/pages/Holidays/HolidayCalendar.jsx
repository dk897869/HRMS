import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

const eventCategories = [
  { label: 'Leave', color: '#10B981', bg: '#DCFCE7' },
  { label: 'Attendance', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Holiday', color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Recruitment', color: '#8B5CF6', bg: '#F3E8FF' },
  { label: 'Training', color: '#06B6D4', bg: '#E0F2FE' },
  { label: 'Other', color: '#64748B', bg: '#F1F5F9' },
];

const initialEvents = {
  1: [{ title: 'Leave - Arjun Malhotra', sub: 'All Day', type: 'Leave' }],
  2: [
    { title: 'Check-in - Team', sub: '9:30 AM', type: 'Attendance' },
    { title: 'Interview - Candidate', sub: '11:00 AM', type: 'Recruitment' },
  ],
  3: [{ title: 'Holiday - Bakrid', sub: 'All Day', type: 'Holiday' }],
  6: [{ title: 'Leave - Priya Shah', sub: 'All Day', type: 'Leave' }],
  7: [{ title: 'Attendance Review', sub: '10:00 AM', type: 'Attendance' }],
  8: [{ title: 'Interview - Candidate', sub: '2:00 PM', type: 'Recruitment' }],
  9: [{ title: 'Training - Leadership', sub: '11:00 AM', type: 'Training' }],
  10: [{ title: 'Task - Reports', sub: '3:00 PM', type: 'Other' }],
  14: [{ title: 'Team Meeting', sub: '10:00 AM', type: 'Attendance' }],
  15: [{ title: 'Employee Birthday', sub: 'All Day', type: 'Holiday' }],
  16: [{ title: 'Leave - Suresh Kumar', sub: 'All Day', type: 'Leave' }],
  17: [{ title: 'Recruitment Drive', sub: '9:00 AM', type: 'Recruitment' }],
  21: [{ title: 'Training - New Hire', sub: '2:00 PM', type: 'Training' }],
  22: [{ title: 'Attendance Audit', sub: '11:00 AM', type: 'Attendance' }],
  23: [{ title: 'Holiday - Independence Day', sub: 'All Day', type: 'Holiday' }],
  24: [{ title: 'Leave - Anjali Verma', sub: 'All Day', type: 'Leave' }],
  28: [{ title: 'Check-in - Managers', sub: '9:30 AM', type: 'Attendance' }],
  29: [{ title: 'Interview - Panel', sub: '1:00 PM', type: 'Recruitment' }],
  30: [{ title: 'HR Reports Review', sub: '3:00 PM', type: 'Other' }],
  31: [{ title: 'Training - Compliance', sub: '11:00 AM', type: 'Training' }],
};

const getCatStyles = (catType) => {
  const matched = eventCategories.find(c => c.label === catType);
  return matched || { color: '#2563EB', bg: '#EFF6FF' };
};

const HolidayCalendar = () => {
  const [events, setEvents] = useState(initialEvents);
  const [viewMode, setViewMode] = useState('Month');
  const [selectedDay, setSelectedDay] = useState(28);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    day: 28,
    title: '',
    time: '10:00 AM',
    type: 'Holiday',
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    const day = Number(newEvent.day);
    const item = { title: newEvent.title, sub: newEvent.time, type: newEvent.type };
    setEvents((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), item],
    }));
    toast.success(`Event "${newEvent.title}" added to July ${day}, 2026!`);
    setOpenAddModal(false);
  };

  // 35 Calendar grid days for July 2026
  const calendarGrid = [
    { day: 29, isCurrent: false }, { day: 30, isCurrent: false },
    { day: 1, isCurrent: true }, { day: 2, isCurrent: true }, { day: 3, isCurrent: true }, { day: 4, isCurrent: true }, { day: 5, isCurrent: true },
    { day: 6, isCurrent: true }, { day: 7, isCurrent: true }, { day: 8, isCurrent: true }, { day: 9, isCurrent: true }, { day: 10, isCurrent: true }, { day: 11, isCurrent: true }, { day: 12, isCurrent: true },
    { day: 13, isCurrent: true }, { day: 14, isCurrent: true }, { day: 15, isCurrent: true }, { day: 16, isCurrent: true }, { day: 17, isCurrent: true }, { day: 18, isCurrent: true }, { day: 19, isCurrent: true },
    { day: 20, isCurrent: true }, { day: 21, isCurrent: true }, { day: 22, isCurrent: true }, { day: 23, isCurrent: true }, { day: 24, isCurrent: true }, { day: 25, isCurrent: true }, { day: 26, isCurrent: true },
    { day: 27, isCurrent: true }, { day: 28, isCurrent: true }, { day: 29, isCurrent: true }, { day: 30, isCurrent: true }, { day: 31, isCurrent: true },
    { day: 1, isCurrent: false }, { day: 2, isCurrent: false },
  ];

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Bar matching Screenshot DITTO */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
            Calendar
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage your activities, events and important dates in one place.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button variant="outlined" size="small" sx={{ borderRadius: '8px', color: '#475569', borderColor: '#CBD5E1', textTransform: 'none', fontWeight: 700 }}>
            Today
          </Button>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" sx={{ border: '1px solid #CBD5E1', borderRadius: '8px' }}><ChevronLeftIcon fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ border: '1px solid #CBD5E1', borderRadius: '8px' }}><ChevronRightIcon fontSize="small" /></IconButton>
          </Box>

          <TextField select size="small" value="July 2026" sx={{ bgcolor: '#FFFFFF', '& .MuiSelect-select': { py: 0.8, fontSize: '0.85rem', fontWeight: 700 } }}>
            <MenuItem value="July 2026">July 2026</MenuItem>
            <MenuItem value="August 2026">August 2026</MenuItem>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{ bgcolor: '#2563EB', borderRadius: '8px', fontWeight: 800, textTransform: 'none', px: 2 }}
          >
            Add Event
          </Button>

          {/* View Selector Pills (Month, Week, Day) */}
          <Paper elevation={0} sx={{ p: 0.4, bgcolor: '#F1F5F9', borderRadius: '10px', display: 'flex' }}>
            {['Month', 'Week', 'Day'].map((m) => (
              <Button
                key={m}
                size="small"
                onClick={() => setViewMode(m)}
                sx={{
                  borderRadius: '8px',
                  px: 1.8,
                  py: 0.4,
                  fontSize: '0.775rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === m ? '#2563EB' : 'transparent',
                  color: viewMode === m ? '#FFFFFF' : '#64748B',
                  '&:hover': { bgcolor: viewMode === m ? '#2563EB' : 'rgba(0,0,0,0.05)' }
                }}
              >
                {m}
              </Button>
            ))}
          </Paper>
        </Box>
      </Box>

      {/* Category Dots Bar matching Screenshot DITTO */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
        {eventCategories.map((cat) => (
          <Box key={cat.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>
              {cat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Main Grid: 7-Column Month Calendar Grid (Left) + Right Sidebar (Right) */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        
        {/* MONTH CALENDAR GRID */}
        <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {/* Weekday Headers */}
          <Grid container sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: '#FAFAFA' }}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
              <Grid item xs={1.714} key={day} sx={{ p: 1.5, textAlign: 'center', borderRight: i < 6 ? '1px solid #F1F5F9' : 'none' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: i >= 5 ? '#EF4444' : '#64748B', fontSize: '0.725rem' }}>
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Month Days Grid */}
          <Grid container>
            {calendarGrid.map((cell, idx) => {
              const dayEvents = cell.isCurrent ? events[cell.day] || [] : [];
              const isSelected = cell.isCurrent && selectedDay === cell.day;
              return (
                <Grid
                  item
                  xs={1.714}
                  key={idx}
                  onClick={() => cell.isCurrent && setSelectedDay(cell.day)}
                  sx={{
                    minHeight: 115,
                    p: 1,
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid #F1F5F9' : 'none',
                    borderBottom: idx < 28 ? '1px solid #F1F5F9' : 'none',
                    bgcolor: isSelected ? 'rgba(37, 99, 235, 0.03)' : cell.isCurrent ? '#FFFFFF' : '#FAFAFA',
                    cursor: cell.isCurrent ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: cell.isCurrent ? 'rgba(37, 99, 235, 0.04)' : '#FAFAFA' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isSelected ? 900 : 700,
                        fontSize: '0.8rem',
                        color: cell.isCurrent ? ((idx + 1) % 7 === 0 || (idx + 1) % 7 === 6 ? '#EF4444' : '#0F172A') : '#CBD5E1',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSelected ? '#2563EB' : 'transparent',
                        color: isSelected ? '#FFFFFF' : undefined
                      }}
                    >
                      {cell.day}
                    </Typography>
                  </Box>

                  {/* Event Chips inside Day Box matching Screenshot DITTO */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                    {dayEvents.map((ev, i) => {
                      const style = getCatStyles(ev.type);
                      return (
                        <Paper
                          key={i}
                          elevation={0}
                          sx={{
                            p: 0.6,
                            px: 0.8,
                            borderRadius: '6px',
                            bgcolor: style.bg,
                            borderLeft: `3px solid ${style.color}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.2
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.675rem', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: style.color, fontSize: '0.6rem', fontWeight: 700 }}>
                            {ev.sub}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* RIGHT SIDEBAR PANEL */}
        <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Mini Calendar Card */}
          <Paper elevation={0} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>Mini Calendar</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <ChevronLeftIcon fontSize="small" sx={{ color: '#64748B', cursor: 'pointer' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>July 2026</Typography>
              <ChevronRightIcon fontSize="small" sx={{ color: '#64748B', cursor: 'pointer' }} />
            </Box>

            <Grid container textAlign="center" sx={{ mb: 1 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <Grid item xs={1.714} key={i}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.65rem' }}>{d}</Typography>
                </Grid>
              ))}
            </Grid>

            <Grid container textAlign="center" spacing={0.5}>
              {[29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2].map((d, i) => {
                const isSel = selectedDay === d && i === 29;
                return (
                  <Grid item xs={1.714} key={i}>
                    <Box
                      onClick={() => setSelectedDay(d)}
                      sx={{
                        width: 24,
                        height: 24,
                        mx: 'auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSel ? '#2563EB' : 'transparent',
                        color: isSel ? '#FFFFFF' : i >= 2 && i <= 32 ? '#1E293B' : '#CBD5E1',
                        fontWeight: isSel ? 900 : 600,
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          {/* Legend Card */}
          <Paper elevation={0} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
              Legend
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {eventCategories.map((c) => (
                <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>{c.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Upcoming Events Card */}
          <Paper elevation={0} sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Upcoming Events
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800, cursor: 'pointer' }}>View All</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { date: '31', month: 'Jul', title: 'Training - Compliance', time: '11:00 AM', color: '#06B6D4' },
                { date: '01', month: 'Aug', title: 'Leave - Personal', time: 'All Day', color: '#10B981' },
                { date: '02', month: 'Aug', title: 'Team Meeting', time: '10:00 AM', color: '#2563EB' },
              ].map((up, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Paper elevation={0} sx={{ px: 1.2, py: 0.6, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center', minWidth: 42 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#0F172A', display: 'block', lineHeight: 1 }}>{up.date}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.6rem' }}>{up.month}</Typography>
                  </Paper>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.1 }}>{up.title}</Typography>
                    <Typography variant="caption" sx={{ color: up.color, fontSize: '0.675rem', fontWeight: 700 }}>{up.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Footer Notice */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #E2E8F0', color: '#94A3B8' }}>
        <Typography variant="caption">© 2026 Lexvra HRMS. All rights reserved.</Typography>
        <Typography variant="caption">Made with ❤️ for better workplaces</Typography>
      </Box>

      {/* Add Event Dialog */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add Event / Holiday
          <IconButton onClick={() => setOpenAddModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleAddEvent}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth type="number" label="Day of July 2026" required value={newEvent.day} onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })} />
            <TextField fullWidth label="Event Title" required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            <TextField fullWidth label="Time / Duration" required value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
            <TextField select fullWidth label="Event Category" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
              {eventCategories.map((c) => (
                <MenuItem key={c.label} value={c.label}>{c.label}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#2563EB' }}>Save Event</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HolidayCalendar;
