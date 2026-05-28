package com.iting.jobportal.admin.dto.response;

import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserListResponse {
  private Long id;
  private String email;
  private Role role;
  private AccountStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime lastLoginAt;

  // Thông tin thêm tùy role
  private String fullName;
  private String avatarUrl;
  private String companyName;
}
