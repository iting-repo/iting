import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';

const initialState = {
  currentUser: null, // Chứa info user: { name, role, token... }
  isLoading: false,
  error: null,
  // Bước 2FA cho tài khoản nội bộ: null | { setup, secret, otpauthUrl, email }
  twoFactor: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 1. Action kích hoạt Saga
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.twoFactor = null;
    },
    // 2. Action khi thành công
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.error = null;
      state.twoFactor = null;
    },

    // ── 2FA ──────────────────────────────────────────────────────────
    // Saga phát hiện backend yêu cầu 2FA → lưu thông tin để LoginPage hiện bước nhập mã
    twoFactorRequired: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.twoFactor = action.payload; // { setup, secret, otpauthUrl, email }
    },
    // LoginPage submit mã → kích hoạt saga xác minh
    twoFactorVerifyRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Quay lại / hủy bước 2FA
    twoFactorClear: (state) => {
      state.twoFactor = null;
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
    },

    // 7. Merge field mới vào currentUser (vd: avatar sau khi upload, fullName sau khi sửa profile).
    // Persist xuống storage để giữ sau reload — phải làm trong reducer vì storage.setUserInfo
    // không tự fire từ middleware nào khác.
    updateUserProfile: (state, action) => {
      if (!state.currentUser) return;
      const next = { ...state.currentUser, ...(action.payload || {}) };
      // Đồng bộ field alias: nếu payload có avatarUrl mà chưa có avatar → set cả 2.
      if (action.payload?.avatarUrl && !action.payload?.avatar) next.avatar = action.payload.avatarUrl;
      if (action.payload?.avatar && !action.payload?.avatarUrl) next.avatarUrl = action.payload.avatar;
      state.currentUser = next;
      try { storage.setUserInfo(next); } catch { /* storage không khả dụng */ }
    },
  }
});

export const {
  loginRequest, loginSuccess, loginFailure, googleLoginRequest, facebookLoginRequest, logout,
  registerRequest, registerSuccess, registerFailure, checkAuth, updateUserProfile,
  twoFactorRequired, twoFactorVerifyRequest, twoFactorClear
} = authSlice.actions;
export default authSlice.reducer;