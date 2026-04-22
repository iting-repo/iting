import axiosInstance from "../utils/axiosInstance";

const jobService = {
    getJobs: async (params) => {
        const response = await axiosInstance.get('/jobs/search', { params });
        return response;
    },

    getJobDetail: async (jobKey) => {
        const response = await axiosInstance.get(`/jobs/${jobKey}`);
        return response;
    },

    getJobDetailByLegacyId: async (id) => {
        const response = await axiosInstance.get(`/jobs/${id}`);
        return response;
    },

    getLatestJobs: async (limit = 10) => {
        return axiosInstance.get('/jobs/latest', {
            params: { limit }
        });
    },

    saveJob: (jobId) => axiosInstance.post(`/candidates/saved-jobs/${jobId}`),
    unsaveJob: (jobId) => axiosInstance.delete(`/candidates/saved-jobs/${jobId}`),
    getSavedJobIds: () => axiosInstance.get('/candidates/saved-jobs/ids'),
};

export default jobService;
