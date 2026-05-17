import axiosInstance from "../utils/axiosInstance";

const adminRoleService = {
  /**
   * Get a user's admin role
   */
  getAdminRole: async (userId) => {
    const response = await axiosInstance.get(`/admin/admin-roles/${userId}`);
    return response;
  },

  /**
   * Update a user's admin role (Super Admin only)
   */
  updateAdminRole: async (userId, adminRole) => {
    const response = await axiosInstance.put(`/admin/admin-roles/${userId}`, { adminRole });
    return response;
  },

  /**
   * Get all admin accounts with their roles
   */
  getAdminAccounts: async () => {
    const response = await axiosInstance.get(`/admin/admin-roles`);
    return response;
  },

  // ── Role Definitions CRUD ─────────────────────────────────────

  /**
   * Get all role definitions (sorted by level desc)
   */
  getRoleDefinitions: async () => {
    const response = await axiosInstance.get(`/admin/admin-roles/definitions`);
    return response;
  },

  /**
   * Create a new role definition
   */
  createRoleDefinition: async (data) => {
    const response = await axiosInstance.post(`/admin/admin-roles/definitions`, data);
    return response;
  },

  /**
   * Update a role definition
   */
  updateRoleDefinition: async (id, data) => {
    const response = await axiosInstance.put(`/admin/admin-roles/definitions/${id}`, data);
    return response;
  },

  /**
   * Delete a role definition (custom roles only)
   */
  deleteRoleDefinition: async (id) => {
    const response = await axiosInstance.delete(`/admin/admin-roles/definitions/${id}`);
    return response;
  },
};

export default adminRoleService;
