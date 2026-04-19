package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.entity.enums.SalaryType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateJobRequest {

    @NotBlank(message = "Tiêu đề công việc không được để trống")
    private String title;

    @NotBlank(message = "Vị trí tuyển dụng không được để trống")
    private String position;

    private List<String> techRequired;

    @NotNull(message = "Loại công việc không được để trống")
    private JobType jobType;

    private ExperienceLevel experienceLevel;

    private String workingDays;

    // Nullable khi salaryType = NEGOTIABLE
    private BigDecimal minSalary;

    // Nullable khi salaryType = NEGOTIABLE
    private BigDecimal maxSalary;

    @NotNull(message = "Hình thức trả lương không được để trống")
    private SalaryType salaryType;

    @NotNull(message = "Số lượng tuyển không được để trống")
    @Positive(message = "Số lượng tuyển phải lớn hơn 0")
    private Integer maxAccept;

    @NotNull(message = "Hạn nộp hồ sơ không được để trống")
    private LocalDate dueDate;

    @NotBlank(message = "Thành phố không được để trống")
    private String province;

    private String ward;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String location;

    private Long locId;

    @NotBlank(message = "Mô tả công việc không được để trống")
    private String description;

    private String responsibilities;
    private String requirements;
    private String benefits;

    private Boolean submitForReview;
}