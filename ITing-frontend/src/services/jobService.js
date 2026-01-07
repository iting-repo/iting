import axiosInstance from "../utils/axiosInstance";

const jobService = {
    // 1. Lấy danh sách công việc (có phân trang & lọc)
    // params: { page, limit, keyword, location, ... }
    getJobs: async (params) => {
        const response = await axiosInstance.get('/jobs/search', { params });
        return response;
    },

    // 1b. Lấy danh sách công việc mới nhất
    getLatestJobs: async (limit = 20) => {
        const response = await axiosInstance.get('/jobs/latest', {
            params: { limit }
        });
        return response;
    },

    // 2. Lấy chi tiết công việc theo ID
    getJobDetail: async (id) => {
        // Assuming the detail endpoint follows the standard usually or as per previous knowledge.
        // If the user's latest jobs has the detail, likely the detail endpoint is similar or standard.
        // The user didn't explicitly give a Detail API, but standard REST is /jobs/{id}.
        // Previous code had /public/jobs/{id}. Let's try /jobs/{id} based on /jobs/latest pattern.
        const response = await axiosInstance.get(`/jobs/${id}`);
        return response;
    },

    // 3. Lấy danh sách công việc của công ty (Employer)
    getCompanyJobs: async (employerId, params) => {
        const response = await axiosInstance.get('/jobs/my-jobs', {
            params: { ...params, employerId }
        });
        return response;
    }
};

export default jobService;
