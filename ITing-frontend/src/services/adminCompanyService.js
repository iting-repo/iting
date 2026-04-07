import axiosInstance from '../utils/axiosInstance';

const adminCompanyService = {

  // Lấy tất cả công ty
  getCompanies: async (params = {}) => {
    const response = await axiosInstance.get(
      '/admin/companies',
      { params }
    );
    return response;
  },

  // Lọc theo trạng thái + verification
  filterCompanies: async (params = {}) => {
    const response = await axiosInstance.get(
      '/admin/companies/filter',
      { params }
    );
    return response;
  },

  // Chi tiết công ty
  getCompanyDetail: async (companyId) => {
    const response = await axiosInstance.get(
      `/admin/companies/${companyId}`
    );
    return response;
  },

  approveCompany: async (companyId, verificationLevel, note) => {
    const response = await axiosInstance.post(
      `/admin/companies/${companyId}/approve`,
      { verificationLevel, note }
    );
    return response;
  },

  rejectCompany: async (companyId, reason) => {
    const response = await axiosInstance.post(
      `/admin/companies/${companyId}/reject`,
      { reason }
    );
    return response;
  },

  requestResubmission: async (companyId, reason) => {
    const response = await axiosInstance.post(
      `/admin/companies/${companyId}/request-resubmission`,
      { reason }
    );
    return response;
  },

  suspendCompany: async (companyId, reason) => {
    const response = await axiosInstance.post(
      `/admin/companies/${companyId}/suspend`,
      { reason }
    );
    return response;
  },

  unsuspendCompany: async (companyId) => {
    const response = await axiosInstance.post(
      `/admin/companies/${companyId}/unsuspend`
    );
    return response;
  },

  exportCompanies: async () => {
    return await axiosInstance.get("/admin/companies/export", {
      responseType: "blob",
    });
  },

  importCompanies: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosInstance.post("/admin/companies/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadTemplate: async () => {
    return await axiosInstance.get("/admin/companies/template", {
      responseType: "blob",
    });
  },

  bulkApprove: async (ids, verificationLevel, note) => {
    return await axiosInstance.post('/admin/companies/bulk-approve', { 
      ids, 
      verificationLevel, 
      note 
    });
  },

  bulkReject: async (ids, reason) => {
    return await axiosInstance.post('/admin/companies/bulk-reject', { ids, reason });
  },

  bulkSuspend: async (ids, reason) => {
    return await axiosInstance.post('/admin/companies/bulk-suspend', { ids, reason });
  },

  bulkDelete: async (ids) => {
    return await axiosInstance.post('/admin/companies/bulk-delete', { ids });
  },

  deleteCompany: async (id) => {
    return await axiosInstance.delete(`/admin/companies/${id}`);
  },

  getCompanyAuditLogs: async (companyId) => {
    return await axiosInstance.get(`/admin/companies/${companyId}/audit-logs`);
  }
};

export default adminCompanyService;