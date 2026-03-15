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
  }

};

export default adminCompanyService;