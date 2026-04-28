import axiosInstance from "../utils/axiosInstance";

const companyService = {
  getMyCompany: async () => {
    return await axiosInstance.get("/companies");
  },

  updateCompanyBasicInfo: async (id, companyData) => {
    return await axiosInstance.put(`/companies/${id}/basic-info`, companyData);
  },

  createEmployerJob: async (jobData) => {
    return await axiosInstance.post("/employer/jobs", jobData);
  },

  updateEmployerJob: async (id, jobData) => {
    return await axiosInstance.put(`/employer/jobs/${id}`, jobData);
  },

  closeEmployerJob: async (id) => {
    const response = await axiosInstance.post(`/employer/jobs/${id}/close`);
    return response;
  },

  reopenEmployerJob: async (id) => {
    const response = await axiosInstance.post(`/employer/jobs/${id}/reopen`);
    return response;
  },

  deleteEmployerJob: async (id) => {
    const response = await axiosInstance.delete(`/employer/jobs/${id}`);
    return response;
  },

  getMyJobs: async (page = 0, size = 10) => {
    return await axiosInstance.get(
      `/employer/jobs/my-jobs?page=${page}&size=${size}`,
    );
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosInstance.post("/company/me/logo/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default companyService;
