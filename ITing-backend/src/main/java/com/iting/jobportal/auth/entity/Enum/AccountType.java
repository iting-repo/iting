package com.iting.jobportal.auth.entity.Enum;

/**
 * Phân loại nguồn gốc tài khoản — dùng để chặn user công khai nhận role quản trị nội bộ.
 *
 * <ul>
 *   <li>{@link #PUBLIC} — Candidate đăng ký Gmail/email. Không được gán role nội bộ ITing.
 *   <li>{@link #COMPANY_STAFF} — HR thuộc một công ty. Chỉ nhận company role trong phạm vi công ty.
 *   <li>{@link #INTERNAL_STAFF} — Nhân sự nội bộ ITing (do Super Admin tạo/mời). Được gán platform
 *       role.
 * </ul>
 */
public enum AccountType {
  PUBLIC,
  COMPANY_STAFF,
  INTERNAL_STAFF
}
