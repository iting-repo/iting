import axiosInstance from "../utils/axiosInstance";

const adminJobService = {

  // Lấy tất cả job
  fetchJobs: async (params = {}) => {
    const response = await axiosInstance.get(
      "/admin/jobs",
      { params }
    );
    return response;
  },

  // Filter job
  filterJobs: async (params = {}) => {
    const response = await axiosInstance.get(
      "/admin/jobs/filter",
      { params }
    );
    return response;
  },

  // Chi tiết job
  getJobDetail: async (jobId) => {
    const response = await axiosInstance.get(
      `/admin/jobs/${jobId}`
    );
    return response;
  },

  // Approve job
  approveJob: async (jobId, note) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/approve`,
      { note }
    );
    return response;
  },

  // Reject job
  rejectJob: async (jobId, reason) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/reject`,
      { reason }
    );
    return response;
  },

  // Request revision
  requestRevision: async (jobId, reason) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/request-revision`,
      { reason }
    );
    return response;
  },

  // Suspend job
  suspendJob: async (jobId, reason) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/suspend`,
      { reason }
    );
    return response;
  },

  // Unsuspend job
  unsuspendJob: async (jobId) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/unsuspend`
    );
    return response;
  },

  // Close job
  closeJob: async (jobId) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/close`
    );
    return response;
  },

  // Feature job
  featureJob: async (jobId) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/feature`
    );
    return response;
  },

  // Unfeature job
  unfeatureJob: async (jobId) => {
    const response = await axiosInstance.post(
      `/admin/jobs/${jobId}/unfeature`
    );
    return response;
  }

};

export default adminJobService;