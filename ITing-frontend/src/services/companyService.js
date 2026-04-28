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

  // Lấy presigned URL để preview giấy phép kinh doanh của chính mình
  getBusinessLicensePresignedUrl: async (minutes = 30) => {
    return await axiosInstance.get("/companies/me/business-license/view", {
      params: { minutes }
    });
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

  uploadCompanyLogo: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosInstance.post("/companies/me/logo/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  submitInfoReview: async () => {
    return await axiosInstance.post("/companies/me/submit-info-review");
  },

  submitDocumentReview: async () => {
    return await axiosInstance.post("/companies/me/submit-document-review");
  },

  submitBusinessLicenseReview: async () => {
    return await axiosInstance.post("/companies/me/submit-business-license-review");
  },

  submitConsentDocumentReview: async () => {
    return await axiosInstance.post("/companies/me/submit-consent-document-review");
  },

  // Lấy presigned URL để xem logo của chính mình
  getLogoPresignedUrl: async (minutes = 60) => {
    return await axiosInstance.get("/companies/me/logo/view", {
      params: { minutes }
    });
  },

  // PUBLIC
  searchCompanies: async (params) => {
    return await axiosInstance.get("/public/companies", { params });
  },

  getCompanyDetail: async (id) => {
    return await axiosInstance.get(`/public/companies/${id}`);
  },

  // FOLLOW
  followCompany: async (companyId) => {
    return await axiosInstance.post("/companies/follow", { companyId });
  },

  unfollowCompany: async (companyId) => {
    return await axiosInstance.delete(`/companies/follow/${companyId}`);
  },

  checkFollowing: async (companyId) => {
    return await axiosInstance.get(`/companies/follow/check/${companyId}`);
  },

  getMyFollowedCompanies: async (page = 0, size = 100) => {
    return await axiosInstance.get("/companies/follow/my-followed", {
      params: { page, size }
    });
  },

  // REVIEWS
  getCompanyReviews: async (companyId) => {
    return await axiosInstance.get(`/public/companies/${companyId}/reviews`);
  },

  getCompanyRatingStats: async (companyId) => {
    return await axiosInstance.get(`/public/companies/${companyId}/rating-stats`);
  },

  postCompanyReview: async (companyId, reviewData) => {
    return await axiosInstance.post(`/candidate/companies/${companyId}/reviews`, reviewData);
  }
};

export default companyService;
