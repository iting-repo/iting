/**
 * Admin Role Permission Configuration
 * ────────────────────────────────────────
 * Defines which sidebar sections and features are accessible
 * for each admin role level.
 *
 * Hierarchy: SUPER_ADMIN > ADMIN > MODERATOR > VIEWER
 */

// Admin role hierarchy with display info
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    key: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Toàn quyền hệ thống, quản lý admin khác',
    level: 100,
    color: '#EF4444',   // red
    badge: 'bg-red-500',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    icon: '👑',
  },
  ADMIN: {
    key: 'ADMIN',
    label: 'Quản trị viên',
    description: 'Quản lý user, company, jobs, CMS',
    level: 75,
    color: '#F59E0B',   // amber
    badge: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '🛡️',
  },
  MODERATOR: {
    key: 'MODERATOR',
    label: 'Kiểm duyệt viên',
    description: 'Kiểm duyệt nội dung, xử lý báo cáo',
    level: 50,
    color: '#3B82F6',   // blue
    badge: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '🔍',
  },
  VIEWER: {
    key: 'VIEWER',
    label: 'Xem',
    description: 'Chỉ xem, không chỉnh sửa',
    level: 25,
    color: '#6B7280',   // gray
    badge: 'bg-gray-500',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: '👁️',
  },
};

/**
 * Sidebar sections with required admin role level.
 * Each item has a `minRole` specifying the minimum AdminRole needed.
 */
export const ADMIN_SIDEBAR_CONFIG = [
  {
    title: 'Tổng quan',
    sectionKey: 'overview',
    minRole: 'VIEWER', // All admins can see
    items: [
      { path: '/admin/dashboard',     label: 'Bảng điều khiển',  minRole: 'VIEWER' },
      { path: '/admin/notifications', label: 'Thông báo',        minRole: 'VIEWER' },
    ],
  },
  {
    title: 'Quản lý',
    sectionKey: 'management',
    minRole: 'MODERATOR',
    items: [
      { path: '/admin/jobs',      label: 'Công việc',     minRole: 'MODERATOR' },
      { path: '/admin/companies', label: 'Công ty',       minRole: 'MODERATOR' },
      { path: '/admin/users',     label: 'Người dùng',    minRole: 'ADMIN' },
      { path: '/admin/reports',   label: 'Báo cáo',       minRole: 'MODERATOR' },
      { path: '/admin/reviews',   label: 'Duyệt đánh giá', minRole: 'MODERATOR' },
    ],
  },
  {
    title: 'CMS',
    sectionKey: 'cms',
    minRole: 'MODERATOR',
    items: [
      { path: '/admin/blog',       label: 'Blog',        minRole: 'MODERATOR' },
      { path: '/admin/faq',        label: 'FAQ',         minRole: 'MODERATOR' },
      { path: '/admin/pages',      label: 'Trang tĩnh',  minRole: 'ADMIN' },
      { path: '/admin/categories', label: 'Danh mục',    minRole: 'ADMIN' },
      { path: '/admin/banner',     label: 'Banner',      minRole: 'MODERATOR' },
    ],
  },
  {
    title: 'Hệ thống',
    sectionKey: 'system',
    minRole: 'ADMIN',
    items: [
      { path: '/admin/roles',           label: 'Phân quyền',       minRole: 'SUPER_ADMIN' },
      { path: '/admin/audit',           label: 'Nhật ký kiểm tra', minRole: 'ADMIN' },
      { path: '/admin/stats',           label: 'Thống kê',         minRole: 'ADMIN' },
      { path: '/admin/config',          label: 'Cấu hình',         minRole: 'SUPER_ADMIN' },
      { path: '/admin/locked-accounts', label: 'Account bị khóa',  minRole: 'ADMIN' },
      { path: '/admin/ab-tests',        label: 'A/B Tests',        minRole: 'ADMIN' },
    ],
  },
];

/**
 * Check if the given adminRole has access to a resource requiring minRole.
 */
export function hasAdminAccess(adminRole, minRole) {
  if (!adminRole) return false;
  const userLevel = ADMIN_ROLES[adminRole]?.level ?? 0;
  const requiredLevel = ADMIN_ROLES[minRole]?.level ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Get the filtered sidebar sections for a given admin role.
 */
export function getFilteredSidebar(adminRole) {
  if (!adminRole) return [];
  
  return ADMIN_SIDEBAR_CONFIG
    .filter(section => hasAdminAccess(adminRole, section.minRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasAdminAccess(adminRole, item.minRole)),
    }))
    .filter(section => section.items.length > 0);
}

/**
 * Get admin role display info.
 */
export function getAdminRoleInfo(adminRole) {
  return ADMIN_ROLES[adminRole] ?? ADMIN_ROLES.VIEWER;
}
