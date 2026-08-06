import { createSlice } from '@reduxjs/toolkit';

const defaultAdminUser = {
  id: 'admin_001',
  name: 'Admin User',
  email: 'admin@lexvra.com',
  role: 'SUPER_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
};

const getInitialUser = () => {
  try {
    const item = localStorage.getItem('user');
    if (item && item !== 'undefined') {
      return JSON.parse(item);
    }
  } catch (e) {
    console.error(e);
  }
  return defaultAdminUser;
};

const getInitialToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined') return token;
  } catch (e) {
    console.error(e);
  }
  return 'demo_jwt_token_2026';
};

const initialUser = getInitialUser();
const initialToken = getInitialToken();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: true,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } catch (e) {
        console.error(e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.error(e);
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem('user', JSON.stringify(state.user));
      } catch (e) {
        console.error(e);
      }
    }
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
