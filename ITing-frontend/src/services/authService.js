import axiosInstance from '../utils/axiosInstance';

const authService = {
    // API Login
    login: async (email, password) => {
        // Gọi API: POST /auth/login
        // Payload: { email, password }
        // Response kỳ vọng: { token, user: { id, name, ... }, role }
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response;
    },

    // API Register
    register: async (userData) => {
        // Gọi API: POST /auth/register
        // Đảm bảo gửi fullName và các trường khác
        const response = await axiosInstance.post('/auth/register', {
            ...userData,
            name: userData.fullName, // Elias name
            full_name: userData.fullName // Elias full_name cho chắc chắn
        });
        return response;
    },

    // API Get Current User (Check Session)
    getCurrentUser: async () => {
        // Gọi API: GET /auth/me (hoặc endpoint tương tự để lấy info user từ token)
        const response = await axiosInstance.get('/auth/me');
        return response;
    },

    // Logout
    logout: () => {
        // Nếu backend cần gọi API logout đe clear cookie/token thì gọi ở đây
        // return axiosInstance.post('/auth/logout');
        return Promise.resolve();
    }
};

// Forgot / Reset password
authService.forgotPassword = async (email) => {
    return axiosInstance.post('/auth/forgot-password', { email });
}

authService.resetPassword = async (token, newPassword) => {
    return axiosInstance.post('/auth/reset-password', { token, newPassword });
}

authService.verifyOtp = async (data) => {
    return axiosInstance.post('/auth/verify-otp', data);
}

authService.resendOtp = async (data) => {
    return axiosInstance.post('/auth/resend-otp', data);
}

authService.changePassword = async (oldPassword, newPassword) => {
    return axiosInstance.post('/auth/change-password', { oldPassword, newPassword });
}

export default authService;