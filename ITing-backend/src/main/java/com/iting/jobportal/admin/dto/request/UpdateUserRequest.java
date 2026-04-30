package com.iting.jobportal.admin.dto.request;

import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private Role role;
    private AccountStatus status;
    private String note; // Ghi chú lý do thay đổi
}
