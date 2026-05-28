package com.iting.jobportal.admin.dto.response;

import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.admin.entity.enums.AdminLevel;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

/** Hồ sơ nhân viên admin: gộp field kế thừa từ Account + field riêng của Admin. */
@Data
@Builder
public class AdminProfileResponse {

  // ── Từ Account ──
  private Long id;
  private String email;
  private String fullName;
  private String phone;
  private String avatarUrl;
  private Role role;
  private AccountStatus status;
  private LocalDateTime lastLoginAt;
  private LocalDateTime createdAt;

  // ── Riêng Admin ──
  private String staffCode;
  private AdminLevel adminLevel;

  public static AdminProfileResponse from(Account account, Admin admin) {
    return AdminProfileResponse.builder()
        .id(account.getId())
        .email(account.getEmail())
        .fullName(account.getFullName())
        .phone(account.getPhone())
        .avatarUrl(account.getAvatarUrl())
        .role(account.getRole())
        .status(account.getStatus())
        .lastLoginAt(account.getLastLoginAt())
        .createdAt(account.getCreatedAt())
        .staffCode(admin != null ? admin.getStaffCode() : null)
        .adminLevel(admin != null ? admin.getAdminLevel() : null)
        .build();
  }
}
