import axiosInstance from "../utils/axiosInstance";

const categoryService = {
  // Lấy danh mục theo loại (SKILL, LOCATION, INDUSTRY)
  getByType: (type) =>
    axiosInstance.get("/admin/categories", { params: { type: type.toUpperCase() } }),

  // Lấy tổng quan số lượng từng loại
  getSummary: () =>
    axiosInstance.get("/admin/categories/summary"),

  // Lấy danh sách ngành nghề từ Industry enum (hệ thống)
  getIndustryEnums: () =>
    axiosInstance.get("/admin/categories/industries/enum"),

  // Lấy chi tiết danh mục
  getById: (id) =>
    axiosInstance.get(`/admin/categories/${id}`),

  // Tạo danh mục mới
  create: (type, data) =>
    axiosInstance.post("/admin/categories", data, { params: { type: type.toUpperCase() } }),

  // Cập nhật danh mục
  update: (id, data) =>
    axiosInstance.put(`/admin/categories/${id}`, data),

  // Xóa danh mục
  delete: (id) =>
    axiosInstance.delete(`/admin/categories/${id}`),

  // Bật/tắt active
  toggleActive: (id) =>
    axiosInstance.patch(`/admin/categories/${id}/toggle-active`),

  // Sắp xếp lại thứ tự
  reorder: (type, orderedIds) =>
    axiosInstance.put("/admin/categories/reorder", { orderedIds }, { params: { type: type.toUpperCase() } }),
};

export default categoryService;
