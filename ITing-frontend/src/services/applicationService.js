import axiosInstance from "../utils/axiosInstance";

const applicationService = {
    // Lấy danh sách ứng viên theo Job ID
    // GET /api/applications/job/{jobId}?employerId=...&page=...&size=...
    getJobApplications: async (jobId, employerId, params) => {
        const response = await axiosInstance.get(`/applications/job/${jobId}`, {
            params: { ...params, employerId }
        });
        return response;
    }
};

export default applicationService;
