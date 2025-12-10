package com.iting.jobportal.application.dto;

import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateApplicationStatusRequest {
    
    @NotNull(message = "Trạng thái không được để trống")
    private ApplicationStatus status;
    
    private String note; // Ghi chú từ nhà tuyển dụng
}

