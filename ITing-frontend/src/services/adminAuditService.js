import axiosInstance from "../utils/axiosInstance";

const adminAuditService = {
  // Lấy danh sách nhật ký hoạt động
  fetchLogs: async (params = {}) => {
    const response = await axiosInstance.get("/admin/audit", { params });
    return response;
  },

  // Danh mục (entityType) thực tế để dựng dropdown lọc
  getCategories: async () => {
    return await axiosInstance.get("/admin/audit/categories");
  },

  // Xuất CSV theo bộ lọc hiện tại — trả về Blob để tải xuống
  exportLogs: async (params = {}) => {
    return await axiosInstance.get("/admin/audit/export", {
      params,
      responseType: "blob",
    });
  },
};

export default adminAuditService;
