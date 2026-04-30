import axiosInstance from "../utils/axiosInstance";

const applicationService = {
    // 1. Candidate nộp đơn ứng tuyển
    applyJob: async (data) => {
        const response = await axiosInstance.post('/candidates/applications/apply', data);
        return response;
    },

    // 2. Employer xem danh sách đơn ứng tuyển theo jobId
    getEmployerApplications: async (jobId, params) => {
        const response = await axiosInstance.get(`/employer/applications/job/${jobId}`, { params });
        return response;
    },

    // 3. Employer chấp nhận ứng viên
    acceptApplication: async (id, note = "") => {
        const response = await axiosInstance.post(`/employer/applications/${id}/accept`, null, {
            params: { note }
        });
        return response;
    },

    // 4. Lấy thống kê đơn ứng tuyển
    getEmployerStats: async () => {
        try {
            // Placeholder: chờ backend triển khai endpoint thực tế
            // const response = await axiosInstance.get('/employer/applications/stats');
            // return response;
            return { total: 0 };
        } catch (error) {
            return { total: 0 };
        }
    }
};

export default applicationService;
