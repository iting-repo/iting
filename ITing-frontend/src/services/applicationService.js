import axiosInstance from "../utils/axiosInstance";

const applicationService = {
    applyJob: async (data) => {
        const response = await axiosInstance.post('/candidates/applications/apply', data);
        return response;
    },

    getEmployerApplications: async (jobKey, params) => {
        const response = await axiosInstance.get(`/employer/applications/job/${jobKey}`, { params });
        return response;
    },
    
    searchEmployerApplications: async (params) => {
        const response = await axiosInstance.get('/employer/applications/search', { params });
        return response;
    },

    acceptApplication: async (id, note = "") => {
        const response = await axiosInstance.post(`/employer/applications/${id}/accept`, null, {
            params: { note }
        });
        return response;
    },

    viewApplication: async (id) => {
        const response = await axiosInstance.get(`/employer/applications/${id}`);
        return response;
    },

    markViewed: async (id) => {
        const response = await axiosInstance.post(`/employer/applications/${id}/view`);
        return response;
    },

    getApplicationDetail: async (id) => {
        const response = await axiosInstance.get(`/employer/applications/${id}`);
        return response;
    },

    checkApplied: async (jobId) => {
        const response = await axiosInstance.get(`/candidates/applications/check/${jobId}`);
        return response;
    },

    getEmployerStats: async () => {
        const response = await axiosInstance.get('/employer/applications/stats');
        return response;
    },

    getMyApplications: async (params) => {
        const response = await axiosInstance.get('/candidates/applications/my-applications', { params });
        return response;
    },
};

export default applicationService;
