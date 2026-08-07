import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import superAdminAuthReducer from './slices/superAdminAuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    superAdminAuth: superAdminAuthReducer,
  },
});

export default store;
