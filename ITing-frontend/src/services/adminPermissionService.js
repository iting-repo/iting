import axiosInstance from "../utils/axiosInstance";

const adminPermissionService = {
  getOverrides: async (userId) => {
    const response = await axiosInstance.get(`/admin/permissions/users/${userId}/overrides`);
    return response;
  },

  replaceOverrides: async (userId, overrides) => {
    const response = await axiosInstance.put(`/admin/permissions/users/${userId}/overrides`, overrides);
    return response;
  },

  clearOverrides: async (userId) => {
    const response = await axiosInstance.delete(`/admin/permissions/users/${userId}/overrides`);
    return response;
  },

  /** Apply the same overrides to multiple users at once */
  bulkReplaceOverrides: async (userIds, overrides) => {
    const response = await axiosInstance.post(`/admin/permissions/bulk-overrides`, { userIds, overrides });
    return response;
  },
};

export default adminPermissionService;
