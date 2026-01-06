package com.iting.jobportal.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplyJobRequest {
    
    @NotNull(message = "Job ID không được để trống")
    private Long jobId;
    
    private String applicantPhone;
    
    // CV có thể là URL đã upload hoặc ID của CV đã có trong hệ thống
    private String cvUrl;
    private Long cvId; // Nếu chọn từ CV đã upload
    
    private String coverLetter; // Thư xin việc
}

