import { call, put, takeLatest } from 'redux-saga/effects';
import authService from '../../services/authService';
import { loginRequest, loginSuccess, loginFailure } from './authSlice';

// Worker Saga
function* handleLogin(action) {
    try {
        const { email, password, navigate } = action.payload;

        // 1. Gọi Mock API
        const data = yield call(authService.login, email, password);

        // 2. Lưu thông tin quan trọng vào LocalStorage (để F5 không mất)
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user_role', data.role);
        // Lưu cả object user để tiện lấy lại (thực tế chỉ nên lưu token)
        localStorage.setItem('user_info', JSON.stringify(data));

        // 3. Bắn action thành công vào Redux
        yield put(loginSuccess(data));

        // 4. Điều hướng trang tùy theo Role
        if (data.role === 'employer') {
            console.log("✅ Đang chuyển hướng vào Dashboard Employer...");
            navigate('/employer/dashboard');
        } else if (data.role === 'candidate') {
            console.log("✅ Đang chuyển hướng vào Jobs...");
            navigate('/jobs');
        } else {
            console.log("❌ Không khớp role nào, về trang chủ.");
            navigate('/');
        }

    } catch (error) {
        // 5. Bắn lỗi
        yield put(loginFailure(error.message));
    }
}

// Watcher Saga
export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
}