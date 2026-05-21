package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.entity.enums.SalaryType;
import com.iting.jobportal.job.entity.enums.WorkingDays;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateJobRequest {

    @NotBlank(message = "Tiêu đề công việc không được để trống")
    @Size(max = 150, message = "Tiêu đề công việc không được vượt quá 150 ký tự")
    private String title;

    @NotBlank(message = "Vị trí tuyển dụng không được để trống")
    private String position;

    private List<String> skills;

    @NotNull(message = "Loại công việc không được để trống")
    private JobType jobType;

    private ExperienceLevel experienceLevel;

    private WorkingDays workingDays;

    /** Ngôn ngữ CV yêu cầu (VIETNAMESE/ENGLISH/BOTH/ANY). Default ANY nếu null. */
    private com.iting.jobportal.job.entity.enums.CvLanguage cvLanguage;

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
    @FutureOrPresent(message = "Hạn nộp hồ sơ không được ở quá khứ")
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