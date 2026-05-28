import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';

const initialState = {
  currentUser: null, // Chứa info user: { name, role, token... }
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 1. Action kích hoạt Saga
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // 2. Action khi thành công
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    // 3. Action khi thất bại
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // 4. Action Google Login
    googleLoginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // 4b. Action Facebook Login
    facebookLoginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // 5. Action Logout
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      // Xóa token trong localStorage
      storage.clearAuth();
    },

    // 5. Action Register
    registerRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload; // Có thể auto login luôn sau khi đăng ký
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // 6. Action Check Auth (Khôi phục session)
    checkAuth: (state) => {
      // Chỉ để kích hoạt saga, có thể set loading nếu muốn
    }
  }
});

export const {
  loginRequest, loginSuccess, loginFailure, googleLoginRequest, facebookLoginRequest, logout,
  registerRequest, registerSuccess, registerFailure, checkAuth
} = authSlice.actions;
export default authSlice.reducer;