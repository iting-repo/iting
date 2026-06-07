package com.iting.jobportal.admin.rbac.enums;

/**
 * Namespace của quyền. Quyền PLATFORM chỉ áp dụng cho nhân sự nội bộ ITing; quyền COMPANY chỉ có
 * hiệu lực trong phạm vi một công ty cụ thể.
 */
public enum PermissionScope {
  PLATFORM,
  COMPANY
}
