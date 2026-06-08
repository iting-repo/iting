import axiosInstance from "../utils/axiosInstance";

// RBAC — vai trò nền tảng (PLATFORM) / doanh nghiệp (COMPANY) + quy trình duyệt.
// axiosInstance đã unwrap response.data nên các hàm trả thẳng dữ liệu.
const rbacService = {
  // Catalog quyền (scope: 'PLATFORM' | 'COMPANY' | undefined = tất cả)
  getPermissions: (scope) =>
    axiosInstance.get("/admin/rbac/permissions", { params: scope ? { scope } : {} }),

  // Vai trò
  getRoles: (scope) =>
    axiosInstance.get("/admin/rbac/roles", { params: scope ? { scope } : {} }),
  getPendingRoles: () => axiosInstance.get("/admin/rbac/roles/pending"),
  getRole: (id) => axiosInstance.get(`/admin/rbac/roles/${id}`),
  createRole: (payload) => axiosInstance.post("/admin/rbac/roles", payload),
  updateRole: (id, payload) => axiosInstance.put(`/admin/rbac/roles/${id}`, payload),
  deleteRole: (id) => axiosInstance.delete(`/admin/rbac/roles/${id}`),

  // Vòng đời duyệt
  submitRole: (id) => axiosInstance.post(`/admin/rbac/roles/${id}/submit`),
  approveRole: (id) => axiosInstance.post(`/admin/rbac/roles/${id}/approve`),
  rejectRole: (id, reason) =>
    axiosInstance.post(`/admin/rbac/roles/${id}/reject`, { reason }),
  setRoleStatus: (id, status) =>
    axiosInstance.patch(`/admin/rbac/roles/${id}/status`, { status }),

  // Gán role cho tài khoản
  assignRole: (accountId, roleCode) =>
    axiosInstance.post("/admin/rbac/assign", { accountId, roleCode }),

  // ── Company RBAC: HR con trong công ty ──────────────────────────────
  getCompanies: (keyword) =>
    axiosInstance.get("/admin/rbac/companies", { params: keyword ? { keyword } : {} }),
  getCompanyMembers: (companyId) =>
    axiosInstance.get(`/admin/rbac/companies/${companyId}/members`),
  getAvailableHr: (keyword) =>
    axiosInstance.get("/admin/rbac/companies/available-hr", { params: keyword ? { keyword } : {} }),
  addCompanyMember: (companyId, accountId, roleCode) =>
    axiosInstance.post(`/admin/rbac/companies/${companyId}/members`, { accountId, roleCode }),
  assignMemberRole: (affiliationId, roleCode) =>
    axiosInstance.put(`/admin/rbac/members/${affiliationId}/role`, { roleCode }),
  removeCompanyMember: (affiliationId) =>
    axiosInstance.delete(`/admin/rbac/members/${affiliationId}`),

  // ── Tài khoản nội bộ (gán platform role) ────────────────────────────
  getStaff: (keyword) =>
    axiosInstance.get("/admin/rbac/staff", { params: keyword ? { keyword } : {} }),
  // Tạo tài khoản nội bộ mới (đăng nhập được). payload: {email, password, fullName, platformRoleCode?}
  createStaff: (payload) => axiosInstance.post("/admin/rbac/staff", payload),
  promoteStaff: (accountId) =>
    axiosInstance.post(`/admin/rbac/staff/${accountId}/promote`),
  clearStaffRole: (accountId) =>
    axiosInstance.delete(`/admin/rbac/staff/${accountId}/role`),

  // Quyền hiệu lực của user hiện tại (ẩn/hiện menu & nút)
  getMyPermissions: () => axiosInstance.get("/admin/rbac/me/permissions"),
};

export default rbacService;
