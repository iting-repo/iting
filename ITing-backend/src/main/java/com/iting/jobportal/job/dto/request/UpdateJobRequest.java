package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateJobRequest {

    @Size(max = 150, message = "Tiêu đề công việc không được vượt quá 150 ký tự")
    private String title;

    private String position;

    private List<String> skills;

    private JobType jobType;

    private ExperienceLevel experienceLevel;

    private WorkingDays workingDays;

    private CvLanguage cvLanguage;

    private BigDecimal minSalary;

    private BigDecimal maxSalary;

    private SalaryType salaryType;

    private Integer maxAccept;

    @FutureOrPresent(message = "Hạn nộp hồ sơ không được ở quá khứ")
    private LocalDate dueDate;

    private String province;

    private String ward;

    private String address;

    private String location;

    private Long locId;

    private String description;

    private String responsibilities;

    private String requirements;

    private String benefits;

    private JobStatus status;
}