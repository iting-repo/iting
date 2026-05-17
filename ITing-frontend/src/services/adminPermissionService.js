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
};

export default adminPermissionService;
