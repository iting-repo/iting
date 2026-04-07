import axiosInstance from "../utils/axiosInstance";

const companyService = {
  getMyCompany: async () => {
    return await axiosInstance.get("/companies/me");
  },

  updateCompanyBasicInfo: async (companyData) => {
    return await axiosInstance.put("/companies/me/basic-info", companyData);
  },

  createCompanyUpdateRequest: async (payload) => {
    return await axiosInstance.put("/companies/me/basic-info", payload);
  },

  getMyLatestCompanyUpdateRequest: async () => {
    return await axiosInstance.get("/companies/me/latest-update-request");
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

  uploadBusinessLicense: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosInstance.put("/companies/me/business-license", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadConsentDocument: async (file, confirmed) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("confirmed", confirmed);
    // formData.append("version", "1.0"); // optional
    return await axiosInstance.post("/companies/me/consent-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default companyService;
