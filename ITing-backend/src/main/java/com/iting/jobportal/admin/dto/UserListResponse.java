package com.iting.jobportal.admin.dto;

import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

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

