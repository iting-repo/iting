import axiosInstance from "../utils/axiosInstance";

const adminConfigService = {
  // Lấy cấu hình hệ thống
  fetchConfig: async () => {
    const response = await axiosInstance.get("/admin/config");
    return response;
  },

  // Cập nhật cấu hình hệ thống
  updateConfig: async (config) => {
    const response = await axiosInstance.put("/admin/config", config);
    return response;
  },

  // Khôi phục cấu hình mặc định
  resetToDefault: async () => {
    const response = await axiosInstance.post("/admin/config/reset");
    return response;
  },

  // Test kết nối SMTP
  testEmailConnection: async (config) => {
    const response = await axiosInstance.post("/admin/config/test-email", config);
    return response;
  }
};

export default adminConfigService;
