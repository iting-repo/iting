package com.iting.jobportal.auth.entity.Enum;

/**
 * Role cơ bản (role_basic) gắn trực tiếp trên {@code Account} và đưa vào JWT để Spring Security
 * kiểm tra {@code hasRole(...)}. Đây là role thô phục vụ route guard, KHÔNG phải nơi mô tả phân
 * quyền chi tiết.
 *
 * <p>Mô hình RBAC đầy đủ (V113) tách hai trục:
 *
 * <ul>
 *   <li>{@link com.iting.jobportal.auth.entity.Enum.AccountType} — nguồn gốc tài khoản (PUBLIC /
 *       COMPANY_STAFF / INTERNAL_STAFF), dùng để chặn user công khai nhận quyền nội bộ.
 *   <li>Vai trò chi tiết nằm ở bảng {@code rbac_role} (PLATFORM: SUPER_ADMIN, ADMIN, MODERATOR,
 *       CONTENT_MANAGER, SUPPORT_STAFF, FINANCE_STAFF, AI_REVIEWER; COMPANY: SUPER_HR, HR_MANAGER,
 *       HR_RECRUITER, HR_VIEWER) — gán cho tài khoản qua {@code Account.adminRole}. Vai trò có vòng
 *       đời duyệt và liên kết permission theo namespace platform.* / company.*.
 * </ul>
 *
 * <p>Mapping legacy (không cần sửa DB): USER → CANDIDATE (ứng viên), COMPANY → EMPLOYER (nhà tuyển
 * dụng); CANDIDATE, EMPLOYER, ADMIN giữ nguyên.
 */
public enum Role {
  // Giá trị mới (chuẩn)
  CANDIDATE,
  EMPLOYER,
  ADMIN,

  // Giá trị cũ trong DB — được map sang role tương đương khi phân quyền
  USER, // → CANDIDATE
  COMPANY; // → EMPLOYER

  public Role normalize() {
    return switch (this) {
      case USER -> CANDIDATE;
      case COMPANY -> EMPLOYER;
      default -> this;
    };
  }

  /** Trả về tên role chuẩn (đã normalize) để gán vào JWT và Spring Security. */
  public String normalizedName() {
    return normalize().name();
  }
}
