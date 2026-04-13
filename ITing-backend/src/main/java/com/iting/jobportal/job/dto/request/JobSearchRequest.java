package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class JobSearchRequest {
    private String keyword;         // Tìm theo từ khóa (position, description)
    private String location;        // Lọc theo địa điểm
    private JobType jobType;        // Lọc theo loại công việc
    private List<JobType> jobTypes; // Lọc nhiều loại công việc
    private ExperienceLevel experienceLevel; // Lọc theo cấp bậc
    private List<ExperienceLevel> experienceLevels; // Lọc nhiều cấp bậc
    private BigDecimal minSalary;         // Lọc theo mức lương tối thiểu
    private BigDecimal maxSalary;         // Lọc theo mức lương tối đa
    private Integer postedWithinHours;    // Lọc theo thời gian đăng (số giờ gần nhất)
    private Long companyId;         // Lọc theo công ty
    private String techRequired;    // Lọc theo công nghệ
    
    // Sắp xếp
    private String sortBy;          // createdAt, salary, relevance
    private String sortOrder;       // asc, desc
    
    // Phân trang
    private Integer page = 0;
    private Integer size = 10;
}

