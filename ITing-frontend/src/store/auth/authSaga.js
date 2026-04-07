import { call, put, takeLatest } from 'redux-saga/effects';
import authService from '../../services/authService';
import googleAuthService from '../../services/googleAuthService';
import { storage } from '../../utils/storage';
import {
    loginRequest, loginSuccess, loginFailure, googleLoginRequest,
    registerRequest, registerSuccess, registerFailure,
    checkAuth
} from './authSlice';

// Worker Saga: Check Auth (Khôi phục session)
function* handleCheckAuth() {
    try {
        const token = storage.getToken();
        const userInfo = storage.getUserInfo();

        if (!token) return;

        if (userInfo) {
            yield put(loginSuccess(userInfo));
        }

        try {
            const response = yield call(authService.getCurrentUser);
            if (response) {
                yield put(loginSuccess(response));
                storage.setUserInfo(response);
            }
        } catch (apiError) {
            console.warn("CheckAuth API Warning:", apiError);
        }

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
            storage.setAuth(token, data.role, data);
            yield put(loginSuccess(data));

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
            storage.setAuth(token, data.role, data);
            yield put(loginSuccess(data));

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