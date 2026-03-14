package com.iting.jobportal.auth.entity.Enum;

/**
 * Role enum - khớp với các giá trị thực tế trong DB.
 *
 * Mapping logic (không cần sửa DB):
 *   USER    → CANDIDATE (ứng viên)
 *   COMPANY → EMPLOYER  (nhà tuyển dụng)
 *   CANDIDATE, EMPLOYER, ADMIN giữ nguyên.
 */
public enum Role {
    // Giá trị mới (chuẩn)
    CANDIDATE,
    EMPLOYER,
    ADMIN,

    // Giá trị cũ trong DB — được map sang role tương đương khi phân quyền
    USER,     // → CANDIDATE
    COMPANY;  // → EMPLOYER

    public Role normalize() {
        return switch (this) {
            case USER    -> CANDIDATE;
            case COMPANY -> EMPLOYER;
            default      -> this;
        };
    }

    /**
     * Trả về tên role chuẩn (đã normalize) để gán vào JWT và Spring Security.
     */
    public String normalizedName() {
        return normalize().name();
    }
}
