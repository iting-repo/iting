package com.iting.jobportal.admin.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class BanUserRequest {
    @NotBlank(message = "Lý do không được để trống")
    private String reason;
    
    private Integer banDays;  // null = vĩnh viễn
}

