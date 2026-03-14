package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class JobSearchRequest {
    private String keyword;         // Tìm theo từ khóa (position, description)
    private String location;        // Lọc theo địa điểm
    private JobType jobType;        // Lọc theo loại công việc
    private ExperienceLevel experienceLevel; // Lọc theo cấp bậc
    private BigDecimal minSalary;         // Lọc theo mức lương tối thiểu
    private BigDecimal maxSalary;         // Lọc theo mức lương tối đa
    private Long companyId;         // Lọc theo công ty
    private String techRequired;    // Lọc theo công nghệ
    
    // Sắp xếp
    private String sortBy;          // createdAt, salary, relevance
    private String sortOrder;       // asc, desc
    
    // Phân trang
    private Integer page = 0;
    private Integer size = 10;
}

