package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateJobRequest {
    
    @NotBlank(message = "Vị trí không được để trống")
    private String position;
    
    @NotBlank(message = "Mô tả công việc không được để trống")
    private String description;

    
    @NotBlank(message = "Địa điểm không được để trống")
    private String location;
    
    private String techRequired;
    
    @NotNull(message = "Loại công việc không được để trống")
    private JobType jobType;
    
    private ExperienceLevel experienceLevel;
    
    private Integer maxAccept;
    
    private BigDecimal minSalary;
    
    private BigDecimal maxSalary;
    
    @NotNull(message = "Ngày hết hạn không được để trống")
    private LocalDate dueDate;
}
