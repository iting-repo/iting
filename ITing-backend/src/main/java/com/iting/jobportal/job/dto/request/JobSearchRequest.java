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
    private String skills;            // Lọc theo kỹ năng
    // Deep filter: industry/domain and sub-categories (e.g. IT -> Software, DevOps)
    private String domain;          // Industry / domain keyword (e.g. "IT")
    private java.util.List<String> subDomains; // Subcategories or domain keywords
    private java.util.List<String> techs; // Multiple tech filters (e.g. ["java","react"]) 
    
    // Sắp xếp
    private String sortBy;          // createdAt, salary, relevance
    private String sortOrder;       // asc, desc
    
    private Boolean isAiSearch = false;
    
    // Phân trang
    private Integer page = 0;
    private Integer size = 10;
}

