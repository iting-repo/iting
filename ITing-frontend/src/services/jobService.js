import axiosInstance from "../utils/axiosInstance";

const jobService = {
    getJobs: async (params) => {
        const response = await axiosInstance.get('/jobs/search', { params });
        return response;
    },

    // 2. Lấy chi tiết công việc theo ID
    getJobDetail: async (id) => {
        const response = await axiosInstance.get(`/jobs/${id}`);
        return response;
    },

    getLatestJobs: async(limit = 10) => {
        const response = await axiosInstance.get(`/jobs/latest`,{
            params: {limit}
        });
    },

    saveJob: (jobId) => axiosInstance.post(`/candidates/saved-jobs/${jobId}`),
    unsaveJob: (jobId) => axiosInstance.delete(`/candidates/saved-jobs/${jobId}`),
    getSavedJobIds: () => axiosInstance.get('/candidates/saved-jobs/ids'),
    analyzeCv: (cvText) => axiosInstance.post('/jobs/analyze-cv', cvText, {
        headers: { 'Content-Type': 'text/plain' }
    }),
};

export default jobService;
