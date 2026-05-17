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

    // 2.5 Employer tìm kiếm & lọc đơn
    searchApplications: async (params) => {
        const response = await axiosInstance.get('/employer/applications/search', { params });
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
            const response = await axiosInstance.get('/employer/applications/stats');
            return response;
        } catch (error) {
            return { total: 0 };
        }
    },

    // 5. Đánh dấu đã xem hồ sơ
    markViewed: async (applicationId) => {
        const response = await axiosInstance.post(`/employer/applications/${applicationId}/view`);
        return response;
    },

    // 6. Từ chối ứng viên
    rejectApplication: async (id, note = "") => {
        const response = await axiosInstance.post(`/employer/applications/${id}/reject`, null, {
            params: { note }
        });
        return response;
    },

    // 7. Cập nhật trạng thái đơn
    updateStatus: async (id, data) => {
        const response = await axiosInstance.put(`/employer/applications/${id}/status`, data);
        return response;
    }
};

export default applicationService;
