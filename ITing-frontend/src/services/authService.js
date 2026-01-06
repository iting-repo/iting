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
    register: async (email, password, name, role, phone, address, website) => {
        // Gọi API: POST /auth/register
        const response = await axiosInstance.post('/auth/register', {
            email,
            password,
            name,
            role,
            phone,
            address,
            website
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

export default authService;