import axiosInstance from "../utils/axiosInstance";

const notificationService = {
  getNotifications: async (params) => {
    return axiosInstance.get("/api/notifications", { params });
  },

  getUnreadNotifications: async (recipientType = "ADMIN") => {
    return axiosInstance.get("/api/notifications/unread", { params: { recipientType } });
  },

  getUnreadCount: async (recipientType = "ADMIN") => {
    return axiosInstance.get("/api/notifications/unread/count", { params: { recipientType } });
  },

  markAsRead: async (notificationId, recipientType = "ADMIN") => {
    return axiosInstance.patch(`/api/notifications/${notificationId}/read`, null, { params: { recipientType } });
  },

  markAllAsRead: async (recipientType = "ADMIN") => {
    return axiosInstance.patch("/api/notifications/read-all", null, { params: { recipientType } });
  },

  deleteNotification: async (notificationId, recipientType = "ADMIN") => {
    return axiosInstance.delete(`/api/notifications/${notificationId}`, { params: { recipientType } });
  },

  createNotification: async (data) => {
    return axiosInstance.post("/api/notifications", data);
  }
};

export default notificationService;
