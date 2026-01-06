import axiosInstance from "../utils/axiosInstance";

const jobService = {
    // 1. Lấy danh sách công việc (có phân trang & lọc)
    // params: { page, limit, keyword, location, ... }
    getJobs: async (params) => {
        const response = await axiosInstance.get('/public/jobs', { params });
        return response;
    },

    // 2. Lấy chi tiết công việc theo ID
    getJobDetail: async (id) => {
        const response = await axiosInstance.get(`/public/jobs/${id}`);
        return response;
    }
};

export default jobService;
