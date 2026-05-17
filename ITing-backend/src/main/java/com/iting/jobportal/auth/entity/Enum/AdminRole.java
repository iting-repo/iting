package com.iting.jobportal.auth.entity.Enum;

/**
 * AdminRole — Phân cấp quyền quản trị.
 *
 * SUPER_ADMIN : Toàn quyền hệ thống, quản lý admin khác
 * ADMIN       : Quản trị tiêu chuẩn (quản lý user, company, jobs, CMS)
 * MODERATOR   : Kiểm duyệt nội dung, xử lý báo cáo
 * VIEWER      : Chỉ xem, không chỉnh sửa
 */
public enum AdminRole {
    SUPER_ADMIN,
    ADMIN,
    MODERATOR,
    VIEWER;

    /**
     * Trả về mức quyền (số lớn = quyền cao hơn).
     */
    public int level() {
        return switch (this) {
            case SUPER_ADMIN -> 100;
            case ADMIN       -> 75;
            case MODERATOR   -> 50;
            case VIEWER      -> 25;
        };
    }

    /**
     * Kiểm tra xem role này có quyền >= role kia không.
     */
    public boolean hasAtLeast(AdminRole other) {
        return this.level() >= other.level();
    }
}
