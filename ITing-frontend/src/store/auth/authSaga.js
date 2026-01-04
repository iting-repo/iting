import { call, put, takeLatest } from 'redux-saga/effects';
import authService from '../../services/authService';
import {
    loginRequest, loginSuccess, loginFailure,
    registerRequest, registerSuccess, registerFailure,
    checkAuth
} from './authSlice';

// Worker Saga: Check Auth (Khôi phục session)
function* handleCheckAuth() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return; // Không có token thì thôi

        // Gọi service check token
        const response = yield call(authService.getCurrentUser);
        // Giả sử response trả về luôn object user nếu success
        yield put(loginSuccess(response));
    } catch (error) {
        // Token hết hạn hoặc không hợp lệ -> logout
        console.error("Token invalid:", error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_info');
    }
}

// Worker Saga: Register
function* handleRegister(action) {
    try {
        const { email, password, name, role, navigate } = action.payload;

        // 1. Gọi API Register
        const data = yield call(authService.register, email, password, name, role);

        // 2. Lưu local storage (nếu backend trả về token ngay khi register)
        if (data.token) {
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('user_info', JSON.stringify(data));
            // 3. Update Redux
            yield put(registerSuccess(data));
        } else {
            yield put(registerSuccess(null)); // Hoặc xử lý khác nếu cần verify email
        }

        // 4. Điều hướng
        if (role === 'employer') {
            navigate('/employer/dashboard');
        } else if (role === 'candidate') {
            navigate('/');
        } else {
            navigate('/');
        }
    } catch (error) {
        // Lấy message từ error response (đã handle trong axiosInstance hoặc lấy mặc định)
        const message = error.message || "Đăng ký thất bại";
        yield put(registerFailure(message));
    }
}

// Worker Saga: Login
function* handleLogin(action) {
    try {
        const { email, password, navigate } = action.payload;

        // 1. Gọi API
        const data = yield call(authService.login, email, password);

        // 2. Lưu thông tin quan trọng vào LocalStorage
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user_role', data.role);
        // Lưu object user 
        localStorage.setItem('user_info', JSON.stringify(data));

        // 3. Bắn action thành công vào Redux
        yield put(loginSuccess(data));

        // 4. Điều hướng trang tùy theo Role
        if (data.role === 'employer') {
            console.log("✅ Đang chuyển hướng vào Dashboard Employer...");
            navigate('/employer/dashboard');
        } else if (data.role === 'candidate') {
            console.log("✅ Đang chuyển hướng vào Jobs...");
            navigate('/');
        } else {
            // Trường hợp role khác hoặc admin
            navigate('/');
        }

    } catch (error) {
        // 5. Bắn lỗi
        const message = error.message || "Đăng nhập thất bại";
        yield put(loginFailure(message));
    }
}

// Watcher Saga
export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(registerRequest.type, handleRegister);
    yield takeLatest(checkAuth.type, handleCheckAuth);
}