package com.iting.jobportal.common.audit;

/**
 * Suy ra mức độ rủi ro của một hành động audit từ action / entityType / mô tả (URI). Heuristic dùng
 * chung cho cả lúc ghi log (aspect) và lúc map response cho bản ghi cũ chưa có risk_level.
 *
 * <p>Quy ước: CRITICAL (phân quyền, cấp/thu hồi role, 2FA) &gt; HIGH (xóa, khóa, từ chối, override)
 * &gt; MEDIUM (duyệt, cập nhật, cấu hình, thanh toán) &gt; LOW (còn lại).
 */
public final class AuditRisk {

  private AuditRisk() {}

  public static String level(String action, String entityType, String description) {
    String t =
        ((action == null ? "" : action)
                + " "
                + (entityType == null ? "" : entityType)
                + " "
                + (description == null ? "" : description))
            .toLowerCase();

    if (t.matches(".*(role|permission|rbac|grant|assign|revoke|2fa|phan-quyen|phân quyền).*")) {
      return "CRITICAL";
    }
    if (t.matches(".*(delete|xoa|ban|lock|suspend|reject|block|override|đình chỉ|khóa|từ chối).*")) {
      return "HIGH";
    }
    if (t.matches(".*(approve|update|patch|config|refund|payment|duyệt|cập nhật|cấu hình).*")) {
      return "MEDIUM";
    }
    return "LOW";
  }
}
