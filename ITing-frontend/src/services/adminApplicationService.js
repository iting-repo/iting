import axiosInstance from "../utils/axiosInstance";

const adminApplicationService = {
   getAllApplications: async (params = {}) => {
      return await axiosInstance.get("/admin/applications", { params });
   },

   deleteApplication: async (id) => {
      return await axiosInstance.delete(`/admin/applications/${id}`);
   },

   getApplicationsByJob: async (jobId, params = {}) => {
      return await axiosInstance.get(`/admin/applications/by-job/${jobId}`, { params });
   },

   getApplicationStatsByJob: async (jobId) => {
      return await axiosInstance.get(`/admin/applications/by-job/${jobId}/stats`);
   },
};

export default adminApplicationService;
