import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('sa_token');
const user = localStorage.getItem('sa_user') ? JSON.parse(localStorage.getItem('sa_user')) : null;

const initialState = {
  token: token || null,
  user: user || null,
  isAuthenticated: !!token,
};

const superAdminAuthSlice = createSlice({
  name: 'superAdminAuth',
  initialState,
  reducers: {
    saLoginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('sa_token', action.payload.token);
      localStorage.setItem('sa_user', JSON.stringify(action.payload.user));
    },
    saLogout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('sa_token');
      localStorage.removeItem('sa_user');
    }
  }
});

export const { saLoginSuccess, saLogout } = superAdminAuthSlice.actions;
export default superAdminAuthSlice.reducer;
