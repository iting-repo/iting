import { createSlice } from '@reduxjs/toolkit';

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
    // 4. Action Logout
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      // Xóa token trong localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
    }
  }
});

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;