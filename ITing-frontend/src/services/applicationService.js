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

    acceptApplication: async (id, note = "") => {
        const response = await axiosInstance.post(`/employer/applications/${id}/accept`, null, {
            params: { note }
        });
        return response;
    },

    viewApplication: async (id) => {
        const response = await axiosInstance.get(`/employer/applications/${id}`);
        return response;
    }
};

export default applicationService;
