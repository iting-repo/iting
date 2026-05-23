import axiosInstance from "../utils/axiosInstance";

/**
 * System Announcement service — popup modal/banner do admin tạo.
 *
 * User-facing:
 *   getActive(route) → tối đa 1 announcement phù hợp role + route + chưa ack
 *   ack(id)          → đánh dấu đã đọc, không show lại
 *
 * Admin:
 *   list / get / create / update / delete
 */
const announcementService = {
  getActive: async (route = "/") => {
    return await axiosInstance.get("/announcements/active", { params: { route } });
  },

  ack: async (id) => {
    return await axiosInstance.post(`/announcements/${id}/ack`);
  },

  // ── Admin ──
  adminList: async (params = {}) => {
    return await axiosInstance.get("/admin/announcements", { params });
  },

  adminGet: async (id) => {
    return await axiosInstance.get(`/admin/announcements/${id}`);
  },

  adminCreate: async (payload) => {
    return await axiosInstance.post("/admin/announcements", payload);
  },

  adminUpdate: async (id, payload) => {
    return await axiosInstance.put(`/admin/announcements/${id}`, payload);
  },

  adminDelete: async (id) => {
    return await axiosInstance.delete(`/admin/announcements/${id}`);
  },
};

export default announcementService;
