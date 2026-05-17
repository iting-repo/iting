package com.iting.jobportal.application.dto.request;

import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import lombok.Data;

@Data
public class ApplicationSearchRequest {
    private Long jobId; // Lọc theo job
    private Long userId; // Lọc theo ứng viên
    private ApplicationStatus status; // Lọc theo trạng thái
    private String keyword; // Tìm theo tên, email

    // Sắp xếp
    private String sortBy; // appliedAt, status
    private String sortOrder; // asc, desc

    // Phân trang
    private Integer page = 0;
    private Integer size = 10;
}
