import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  activeRole: 'ADMIN',
  themeMode: 'light',
  notifications: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    }
  }
});

export const { toggleSidebar, setActiveRole, addNotification } = uiSlice.actions;
export default uiSlice.reducer;
