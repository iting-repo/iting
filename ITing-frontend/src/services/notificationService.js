import axiosInstance from "../utils/axiosInstance";

const notificationService = {
  getNotifications: async (params) => {
    return axiosInstance.get("/notifications", { params });
  },

  getUnreadNotifications: async (recipientType = "ADMIN") => {
    return axiosInstance.get("/notifications/unread", { params: { recipientType } });
  },

  getUnreadCount: async (recipientType = "ADMIN") => {
    return axiosInstance.get("/notifications/unread/count", { params: { recipientType } });
  },

  markAsRead: async (notificationId, recipientType = "ADMIN") => {
    return axiosInstance.patch(`/notifications/${notificationId}/read`, null, { params: { recipientType } });
  },

  markAllAsRead: async (recipientType = "ADMIN") => {
    return axiosInstance.patch("/notifications/read-all", null, { params: { recipientType } });
  },

  deleteNotification: async (notificationId, recipientType = "ADMIN") => {
    return axiosInstance.delete(`/notifications/${notificationId}`, { params: { recipientType } });
  },

  createNotification: async (data) => {
    return axiosInstance.post("/notifications", data);
  }
};

export default notificationService;
