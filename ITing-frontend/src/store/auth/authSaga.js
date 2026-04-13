import { call, put, takeLatest } from 'redux-saga/effects';
import authService from '../../services/authService';
import googleAuthService from '../../services/googleAuthService';
import axiosInstance from '../../utils/axiosInstance';
import { storage } from '../../utils/storage';
import {
    loginRequest, loginSuccess, loginFailure, googleLoginRequest,
    registerRequest, registerSuccess, registerFailure,
    checkAuth
} from './authSlice';

function buildFallbackUser(baseUser = {}) {
    const displayName =
        baseUser.name ||
        baseUser.fullName ||
        baseUser.companyName ||
        baseUser.email ||
        'User';

    return {
        ...baseUser,
        name: displayName,
        fullName: baseUser.fullName || displayName,
        avatar: baseUser.avatar || baseUser.avatarUrl || baseUser.logoUrl || '',
        avatarUrl: baseUser.avatarUrl || baseUser.avatar || '',
    };
}

function* hydrateUserProfile(baseUser) {
    const role = baseUser?.role;

    try {
        if (role === 'CANDIDATE') {
            const profile = yield call(axiosInstance.get, '/user/profile');
            return buildFallbackUser({
                ...baseUser,
                userId: profile?.userId || baseUser?.userId,
                name: profile?.fullName || baseUser?.name,
                fullName: profile?.fullName || baseUser?.fullName,
                avatar: profile?.avatarUrl || baseUser?.avatar,
                avatarUrl: profile?.avatarUrl || baseUser?.avatarUrl,
                phoneNum: profile?.phoneNum || baseUser?.phoneNum,
            });
        }

        if (role === 'EMPLOYER') {
            const company = yield call(axiosInstance.get, '/companies/me');
            return buildFallbackUser({
                ...baseUser,
                companyId: company?.id || baseUser?.companyId,
                name: company?.name || baseUser?.name,
                companyName: company?.name || baseUser?.companyName,
                avatar: company?.logoUrl || baseUser?.avatar,
                logoUrl: company?.logoUrl || baseUser?.logoUrl,
                email: company?.accountEmail || baseUser?.email,
            });
        }
    } catch (error) {
        console.warn('Hydrate user profile warning:', error);
    }

    return buildFallbackUser(baseUser);
}

// Worker Saga: Check Auth (Khôi phục session)
function* handleCheckAuth() {
    try {
        const token = storage.getToken();
        const userInfo = storage.getUserInfo();
        const role = storage.getRole() || userInfo?.role;

        if (!token) {
            return;
        }

        if (!userInfo && !role) {
            return;
        }

        const baseUser = buildFallbackUser({
            ...(userInfo || {}),
            role: role || userInfo?.role,
        });

        const hydratedUser = yield call(hydrateUserProfile, baseUser);
        yield put(loginSuccess(hydratedUser));
        storage.setUserInfo(hydratedUser);

    } catch (error) {
        console.error("Auth Saga Error:", error);
        storage.clearAuth();
    }
}

// Worker Saga: Register
function* handleRegister(action) {
    try {
        const { navigate } = action.payload;
        yield call(authService.register, action.payload);
        yield put(registerSuccess(null));
        navigate('/login');
    } catch (error) {
        const message = error.error || error.message || "Đăng ký thất bại";
        yield put(registerFailure(message));
    }
}

// Worker Saga: Google Login
function* handleGoogleLogin(action) {
    try {
        const { tokenId, navigate } = action.payload;
        console.log("Starting Google login request...");
        
        const data = yield call(googleAuthService.loginWithGoogle, tokenId);
        console.log("Google Login success:", data);

        const token = data.token || data.accessToken;
        if (token) {
            data.token = token;
            const hydratedUser = yield call(hydrateUserProfile, data);
            storage.setAuth(token, data.role, hydratedUser);
            yield put(loginSuccess(hydratedUser));

            if (data.role === 'EMPLOYER') {
                navigate('/employer/dashboard');
            } else {
                navigate('/');
            }
        }
    } catch (error) {
        console.error("Google Login saga error:", error);
        const message = error.error || error.message || "Đăng nhập Google thất bại";
        yield put(loginFailure(message));
    }
}

// Worker Saga: Login
function* handleLogin(action) {
    try {
        const { email, password, navigate } = action.payload;
        console.log("Starting login request for:", email);
        const data = yield call(authService.login, email, password);
        
        const token = data.token || data.accessToken;
        if (token) {
            data.token = token;
            const hydratedUser = yield call(hydrateUserProfile, data);
            storage.setAuth(token, data.role, hydratedUser);
            yield put(loginSuccess(hydratedUser));

            if (data.role === 'EMPLOYER') {
                navigate('/employer/dashboard');
            } else if (data.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } else {
            throw new Error("API response missing token");
        }

    } catch (error) {
        console.error("Login saga error:", error);
        const message = error.error || error.message || "Đăng nhập thất bại";
        yield put(loginFailure(message));
    }
}

// Watcher Saga
export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(googleLoginRequest.type, handleGoogleLogin);
    yield takeLatest(registerRequest.type, handleRegister);
    yield takeLatest(checkAuth.type, handleCheckAuth);
}
