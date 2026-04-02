import axiosInstance from "../utils/axiosInstance";

const adminUserService = {
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/admin/users", { params });
      console.log("[API] GET /admin/users - response:", response);
      return response;
    } catch (error) {
      console.error("[API] GET /admin/users - error:", error);
      throw error;
    }
  },

  getUserDetail: async (userId) => {
    try {
      console.log(`[API] GET /admin/users/${userId}`);
      const response = await axiosInstance.get(`/admin/users/${userId}`);
      console.log(`[API] GET /admin/users/${userId} - response:`, response);
      return response;
    } catch (error) {
      console.error(`[API] GET /admin/users/${userId} - error:`, error);
      throw error;
    }
  },

  updateUser: async (userId, data) => {
    try {
      console.log(`[API] PUT /admin/users/${userId} - payload:`, data);
      const response = await axiosInstance.put(`/admin/users/${userId}`, data);
      console.log(`[API] PUT /admin/users/${userId} - response:`, response);
      return response;
    } catch (error) {
      console.error(`[API] PUT /admin/users/${userId} - error:`, error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      console.log(`[API] DELETE /admin/users/${userId}`);
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      console.log(`[API] DELETE /admin/users/${userId} - response:`, response);
      return response;
    } catch (error) {
      console.error(`[API] DELETE /admin/users/${userId} - error:`, error);
      throw error;
    }
  },

  unbanUser: async (userId) => {
    try {
      console.log(`[API] POST /admin/users/${userId}/unban`);
      const response = await axiosInstance.post(`/admin/users/${userId}/unban`);
      console.log(`[API] POST /admin/users/${userId}/unban - response:`, response);
      return response;
    } catch (error) {
      console.error(`[API] POST /admin/users/${userId}/unban - error:`, error);
      throw error;
    }
  },

  banUser: async (userId, reason, banDays) => {
    try {
      console.log(`[API] POST /admin/users/${userId}/ban - payload:`, { reason, banDays });
      const response = await axiosInstance.post(`/admin/users/${userId}/ban`, { reason, banDays });
      console.log(`[API] POST /admin/users/${userId}/ban - response:`, response);
      return response;
    } catch (error) {
      console.error(`[API] POST /admin/users/${userId}/ban - error:`, error);
      throw error;
    }
  },
};

export default adminUserService;