import { call, put, takeLatest } from 'redux-saga/effects';
import authService from '../../services/authService';
import {
    loginRequest, loginSuccess, loginFailure,
    registerRequest, registerSuccess, registerFailure,
    checkAuth
} from './authSlice';
import { fetchProfileRequest } from '../user/userSlice';
import { fetchCompanyRequest } from '../company/companySlice';
import { fetchCompanyJobsRequest } from '../job/jobSlice';


// Worker Saga: Check Auth (Khôi phục session)
function* handleCheckAuth() {
    try {
        const token = localStorage.getItem('access_token');
        const userInfo = localStorage.getItem('user_info');

        if (!token) return;

        // 1. Ưu tiên: Restore từ localStorage ngay lập tức để UI không bị "nháy"
        if (userInfo) {
            yield put(loginSuccess(JSON.parse(userInfo)));
        }

        // 2. Trigger fetch profile để validate session và lấy data mới nhất
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            if (parsedUser.role === 'CANDIDATE' && parsedUser.userId) {
                yield put(fetchProfileRequest({ userId: parsedUser.userId }));
            } else if (parsedUser.role === 'EMPLOYER' && parsedUser.userId) {
                yield put(fetchCompanyRequest({ companyId: parsedUser.userId }));
                yield put(fetchCompanyJobsRequest({ employerId: parsedUser.userId, page: 0, size: 5 })); // Fetch 5 jobs for dashboard
            }
        }
    } catch (error) {
        // Token không hợp lệ hoặc parse lỗi
        console.error("Auth Saga Error:", error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_info');
    }
}

// Worker Saga: Register
function* handleRegister(action) {
    try {
        const { email, password, name, role, phone, address, website, navigate } = action.payload;

        // 1. Gọi API Register
        const data = yield call(authService.register, email, password, name, role, phone, address, website);

        // 2. Không Auto Login -> Chuyển về trang Login để người dùng tự đăng nhập
        // (Theo yêu cầu: đăng ký xong về trang login)

        // const token = data.token; // Nếu backend có trả về cũng không lưu
        yield put(registerSuccess(null)); // Tắt loading, không set currentUser

        // 3. Điều hướng về trang Login
        navigate('/login');

        /* 
        // Logic cũ: Auto Login
        if (data.token) {
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('user_info', JSON.stringify(data));
            yield put(registerSuccess(data));
        } else {
            yield put(registerSuccess(null)); 
        }

        if (role === 'EMPLOYER') {
            navigate('/employer/dashboard');
        } else if (role === 'CANDIDATE') {
            navigate('/');
        } else {
            navigate('/');
        } 
        */
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
        console.log("Starting login request for:", email);
        const data = yield call(authService.login, email, password);
        console.log("Login success, response data:", data);

        // 2. Lưu thông tin quan trọng vào LocalStorage
        if (data.token) {
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('user_info', JSON.stringify(data));

            // 3. Bắn action thành công vào Redux
            yield put(loginSuccess(data));

            // 3.1 Fetch profile ngay sau khi login
            if (data.role === 'CANDIDATE' && data.userId) {
                yield put(fetchProfileRequest({ userId: data.userId }));
            } else if (data.role === 'EMPLOYER' && data.userId) {
                yield put(fetchCompanyRequest({ companyId: data.userId }));
                yield put(fetchCompanyJobsRequest({ employerId: data.userId, page: 0, size: 5 })); // Fetch 5 jobs for dashboard
            }

            // 4. Điều hướng trang tùy theo Role
            if (data.role === 'EMPLOYER') {
                console.log("✅ Đang chuyển hướng vào Dashboard Employer...");
                navigate('/employer/dashboard');
            } else if (data.role === 'CANDIDATE') {
                console.log("✅ Đang chuyển hướng vào Jobs...");
                navigate('/');
            } else if (data.role === 'ADMIN') {
                console.log("✅ Đang chuyển hướng vào Admin Dashboard...");
                navigate('/admin/dashboard');
            } else {
                // Trường hợp role khác
                console.log("⚠️ Role unknown or generic, navigating to home:", data.role);
                navigate('/');
            }
        } else {
            throw new Error("API response missing token");
        }

    } catch (error) {
        // 5. Bắn lỗi
        console.error("Login saga error:", error);
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