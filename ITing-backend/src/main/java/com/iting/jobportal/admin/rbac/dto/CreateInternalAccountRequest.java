package com.iting.jobportal.admin.rbac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Admin tạo tài khoản nội bộ ITing (nhân sự hệ thống) để đăng nhập. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInternalAccountRequest {

  @NotBlank(message = "Email không được để trống")
  @Email(message = "Email không hợp lệ")
  private String email;

  @NotBlank(message = "Mật khẩu không được để trống")
  @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
  private String password;

  @NotBlank(message = "Họ tên không được để trống")
  private String fullName;

  /** Tuỳ chọn: gán luôn vai trò nền tảng (PLATFORM, đang ACTIVE) khi tạo. */
  private String platformRoleCode;
}
