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
        const response = await axiosInstance.get('/jobs/latest', {
            params: { limit }
        });
        return response.data;
    }
};

export default jobService;
