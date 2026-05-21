import axiosInstance from "../utils/axiosInstance";

const notificationPreferenceService = {
  /** GET /api/candidate/notification-preferences */
  get: async () => {
    const res = await axiosInstance.get("/candidate/notification-preferences");
    return res?.data ?? res;
  },

  /** PUT /api/candidate/notification-preferences (partial update) */
  update: async (payload) => {
    const res = await axiosInstance.put(
      "/candidate/notification-preferences",
      payload
    );
    return res?.data ?? res;
  },
};

export default notificationPreferenceService;
