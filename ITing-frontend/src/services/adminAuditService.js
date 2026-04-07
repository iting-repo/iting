import axiosInstance from "../utils/axiosInstance";

const adminAuditService = {
  // Lấy danh sách nhật ký hoạt động
  fetchLogs: async (params = {}) => {
    const response = await axiosInstance.get("/admin/audit", { params });
    return response;
  },

  // Xuất dữ liệu ra CSV (Placeholder - có thể xử lý ở backend sau)
  exportLogs: async (params = {}) => {
    // Trong thực tế sẽ gọi endpoint download
    // const response = await axiosInstance.get("/admin/audit/export", { params, responseType: 'blob' });
    // return response;
    console.log("Exporting logs with filters:", params);
    return null;
  }
};

export default adminAuditService;
