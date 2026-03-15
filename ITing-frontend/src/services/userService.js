import axiosInstance from '../utils/axiosInstance';

const userService = {
    // API Get Profile
    getProfile: async (userId) => {
        console.log('[DEBUG] userService getProfile userId:', userId);
        // Gọi API: GET /api/user/profile?userId=...
        const response = await axiosInstance.get('/user/profile', {
            params: { userId }
        });
        console.log('[DEBUG] userService getProfile response:', response);
        return response;
    },
};

export default userService;
