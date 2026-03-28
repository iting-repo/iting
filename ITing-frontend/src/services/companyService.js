import axiosInstance from "../utils/axiosInstance";

const companyService = {
  // Lấy thông tin công ty của tài khoản đang đăng nhập
  getMyCompany: async () => {
    const response = await axiosInstance.get('/companies');
    return response;
  },

  // Cập nhật thông tin công ty cơ bản
  updateCompanyBasicInfo: async (id, companyData) => {
    const response = await axiosInstance.put(`/companies/${id}/basic-info`, companyData);
    return response;
  }
};

export default companyService;
