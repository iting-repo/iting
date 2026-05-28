package com.iting.jobportal.job.entity;

import com.iting.jobportal.common.converter.StringListConverter;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.enums.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(
    name = "Job",
    indexes = {
      @Index(name = "idx_job_company", columnList = "Company_id"),
      @Index(name = "idx_job_status", columnList = "Status"),
      @Index(name = "idx_job_city", columnList = "Province")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // ===== RELATION =====
  // EAGER: hầu hết view (admin list, dashboard, public job card) cần
  // company.name + logo. Lazy thường rơi vào LazyInit khi Jackson serialize
  // ngoài tx. Trade-off: thêm 1 JOIN khi load Job — acceptable cho use case.
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "Company_id", nullable = false)
  private Company company;

  // ===== BASIC INFO =====
  @Column(nullable = false)
  private String title;

  private String position;

  @Convert(converter = StringListConverter.class)
  @Column(name = "skills", columnDefinition = "TEXT")
  private List<String> skills;

  @Enumerated(EnumType.STRING)
  private JobType jobType;

  @Enumerated(EnumType.STRING)
  private ExperienceLevel experienceLevel;

  @Enumerated(EnumType.STRING)
  private WorkingDays workingDays;

  /** Ngôn ngữ CV/Cover letter mà HR yêu cầu — ứng viên cần biết để nộp đúng loại. */
  @Enumerated(EnumType.STRING)
  @Column(name = "cv_language", length = 20)
  private CvLanguage cvLanguage;

  // ===== SALARY =====
  private BigDecimal minSalary;
  private BigDecimal maxSalary;

  @Enumerated(EnumType.STRING)
  private SalaryType salaryType;

  // ===== QUANTITY =====
  private Integer maxAccept;
  private Integer currentAccepted;

  private LocalDate dueDate;

  // ===== LOCATION =====
  private String province;
  private String ward;
  private String address;
  private String location;

  private Long locId; // ✅ GIỮ

  // ===== CONTENT =====
  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(columnDefinition = "TEXT")
  private String responsibilities;

  @Column(columnDefinition = "TEXT")
  private String requirements;

  @Column(columnDefinition = "TEXT")
  private String benefits;

  // ===== SYSTEM =====
  private Integer viewCount;
  private Integer applicationCount;
  private Boolean featured;

  @Enumerated(EnumType.STRING)
  private JobStatus status;

  // ===== REVIEW =====
  @Column(columnDefinition = "TEXT")
  private String reviewReason;

  private Long reviewedBy;
  private LocalDateTime reviewedAt;

  private String aiReviewStatus;

  @Column(columnDefinition = "TEXT")
  private String aiReviewReason;

  @Column(columnDefinition = "TEXT")
  private String jobEmbedding;

  private LocalDateTime embeddingUpdatedAt;

  // ===== HR POSTER =====
  /** Account.id của HR đã đăng job này (audit trail; FK soft tới account). */
  @Column(name = "posted_by_hr_id")
  private Long postedByHrId;

  // Paid boost / featured promotion (added by V75). NULL = not boosted.
  @Column(name = "featured_until")
  private LocalDateTime featuredUntil;

  @Column(name = "featured_tier", length = 20)
  private String featuredTier;

  // ===== AUDIT =====
  private LocalDateTime createdAt;
  private LocalDateTime lastUpdate;

  // ===== AUTO LOGIC =====
  @PrePersist
  protected void onCreate() {
    if (status == null) status = JobStatus.PENDING;
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (lastUpdate == null) lastUpdate = LocalDateTime.now();
    if (viewCount == null) viewCount = 0;
    if (applicationCount == null) applicationCount = 0;
    if (currentAccepted == null) currentAccepted = 0;
    if (maxAccept == null) maxAccept = 0;
    if (featured == null) featured = false;
    if (cvLanguage == null) cvLanguage = CvLanguage.ANY;

    if (location == null) {
      location = buildLocation();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    lastUpdate = LocalDateTime.now();
  }

  private String buildLocation() {
    StringBuilder sb = new StringBuilder();

    if (address != null) sb.append(address);
    if (ward != null) sb.append(", ").append(ward);
    if (province != null) sb.append(", ").append(province);

    return sb.toString();
  }
}
