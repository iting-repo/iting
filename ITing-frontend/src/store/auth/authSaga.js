import { call, put, takeLatest } from 'redux-saga/effects';
import authService from '../../services/authService';
import googleAuthService from '../../services/googleAuthService';
import facebookAuthService from '../../services/facebookAuthService';
import axiosInstance from '../../utils/axiosInstance';
import { storage } from '../../utils/storage';
import {
    loginRequest, loginSuccess, loginFailure, googleLoginRequest, facebookLoginRequest,
    registerRequest, registerSuccess, registerFailure,
    checkAuth, twoFactorRequired, twoFactorVerifyRequest
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
        // HR mới chưa xác thực company → /companies/me trả 403/400/404 là BÌNH THƯỜNG.
        // Không log như cảnh báo để tránh gây hiểu nhầm là lỗi hệ thống.
        const status = error?.httpStatus || error?.response?.status;
        if (![400, 403, 404].includes(status)) {
            console.warn('Hydrate user profile warning:', error);
        }
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
        navigate('/verify-otp', { state: { email: action.payload.email } });
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

// Worker Saga: Facebook Login
function* handleFacebookLogin(action) {
    try {
        const { accessToken, navigate } = action.payload;
        console.log("Starting Facebook login request...");

        const data = yield call(facebookAuthService.loginWithFacebook, accessToken);
        console.log("Facebook Login success:", data);

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
        console.error("Facebook Login saga error:", error);
        const message = error.error || error.message || "Đăng nhập Facebook thất bại";
        yield put(loginFailure(message));
    }
}

// Worker Saga: Login
function* handleLogin(action) {
    try {
        const { email, password, navigate } = action.payload;
        console.log("Starting login request for:", email);
        const data = yield call(authService.login, email, password);

        // Tài khoản nội bộ → backend yêu cầu xác thực 2 bước (chưa cấp token)
        if (data?.twoFactorRequired) {
            yield put(twoFactorRequired({
                setup: !!data.twoFactorSetup,
                secret: data.twoFactorSecret || null,
                otpauthUrl: data.otpauthUrl || null,
                email,
            }));
            return;
        }

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

// Worker Saga: 2FA verify (cả setup lần đầu lẫn đăng nhập thường)
function* handleTwoFactorVerify(action) {
    try {
        const { email, password, code, setup, navigate } = action.payload;
        const fn = setup ? authService.twoFactorSetupVerify : authService.twoFactorVerify;
        const data = yield call(fn, { email, password, code });

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
        console.error("2FA verify saga error:", error);
        const message = error.error || error.response?.data?.message || error.message || "Mã xác thực không đúng";
        yield put(loginFailure(message));
    }
}

// Watcher Saga
export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(twoFactorVerifyRequest.type, handleTwoFactorVerify);
    yield takeLatest(googleLoginRequest.type, handleGoogleLogin);
    yield takeLatest(facebookLoginRequest.type, handleFacebookLogin);
    yield takeLatest(registerRequest.type, handleRegister);
    yield takeLatest(checkAuth.type, handleCheckAuth);
}
