# ITing Backend Entities

This document contains all entity classes in the ITing backend project.

---

## 1. User Profile Module

### CV
```java
package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.userprofile.entity.enums.CvStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CV")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Title", length = 255)
    private String title;

    @Column(name = "File_path", columnDefinition = "TEXT", nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "Cv_status", length = 50)
    private CvStatus cvStatus;

    @Column(name = "Is_default")
    private Boolean isDefault = false;

    @Column(name = "Upload_time")
    private LocalDateTime uploadedAt;
}
```

### Skill
```java
package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Skill")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Name", length = 100)
    private String name;

    @Column(name = "Level", length = 50)
    private String level;
}
```

### SocialLink
```java
package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "SocialLink",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_social_profile_platform", columnNames = {"profile_id", "Platform"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(name = "Platform", length = 50, nullable = false)
    private SocialPlatform platform;

    @Column(name = "Url", columnDefinition = "TEXT", nullable = false)
    private String url;
}
```

### UserProfile
```java
package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.userprofile.entity.enums.EmploymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
public class UserProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    // Thông tin cơ bản
    @Column(name = "headline", length = 255)
    private String headline; // VD: Backend Java Developer | Spring Boot

    @Column(name = "location", length = 255)
    private String location; // khu vực

    @Column(name = "total_experience_years")
    private Integer totalExperienceYears; // tổng số năm kinh nghiệm

    @Column(name = "education_summary", length = 255)
    private String educationSummary; // VD: ĐH Bách Khoa Hà Nội

    @Column(name = "short_bio", columnDefinition = "TEXT")
    private String shortBio; // giới thiệu ngắn

    // Trạng thái tìm việc / lương mong muốn
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", length = 50)
    private EmploymentStatus employmentStatus;

    @Column(name = "is_open_to_work")
    private Boolean openToWork = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Quan hệ
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Experience> workExperiences = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificate> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialLink> externalLinks = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CV> cvs = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Portfolio> portfolios = new ArrayList<>();
}
```

### Portfolio
```java
package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Portfolio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    private String title;
    private String url;
    private String description;
}
```

### Experience
```java
package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Experience")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Company_name", length = 255)
    private String companyName;

    @Column(name = "Position", length = 255)
    private String position;

    @Column(name = "Start_date")
    private LocalDate startDate;

    @Column(name = "End_date")
    private LocalDate endDate;

    @Column(name = "Is_current")
    private Boolean isCurrent;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;
}
```

### ContactInfo
```java
package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contact_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactInfo {

    @Id
    private String userId;

    private String phone;
    private String email;
}
```

### Education
```java
package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Education")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "School_name", length = 255)
    private String schoolName;

    @Column(name = "Major", length = 255)
    private String major;

    @Column(name = "Area_of_study", length = 255)
    private String areaOfStudy;

    @Column(name = "Degree", length = 100)
    private String degree;

    @Column(name = "Start_date")
    private LocalDate startDate;

    @Column(name = "End_date")
    private LocalDate endDate;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;
}
```

### Certificate
```java
package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Certificate")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Title", length = 255)
    private String title;

    @Column(name = "Issuing_organization", length = 255)
    private String issuingOrganization;

    @Column(name = "Issue_date")
    private LocalDate issueDate;

    @Column(name = "Expiration_date")
    private LocalDate expirationDate;

    @Column(name = "Credential_id", length = 255)
    private String credentialId;

    @Column(name = "Credential_url", columnDefinition = "TEXT")
    private String credentialUrl;

    @Column(name = "Does_not_expire")
    private Boolean doesNotExpire;
}
```

---

## 2. User Module

### User
```java
package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
public class User {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "Id")
    private Account account;

    @Column(name = "Phone_num", length = 20)
    private String phoneNum;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;

    @Column(name = "full_name", length = 255, nullable = false)
    private String fullName;

    @Column(name = "Avatar", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
```

---

## 3. Notification Module

### Notification
```java
package com.iting.jobportal.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "time")
    private LocalDateTime time;

    @PrePersist
    protected void onCreate() {
        if (time == null) {
            time = LocalDateTime.now();
        }
    }
}
```

### UserFollowCompany
```java
package com.iting.jobportal.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_follow_company", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "company_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFollowCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "notification_id", nullable = false)
    private Integer notificationId;

    @Column(name = "follow_date")
    private LocalDateTime followDate;

    @Column(name = "followed_at", nullable = false)
    private LocalDateTime followedAt;

    @PrePersist
    protected void onCreate() {
        if (followedAt == null) {
            followedAt = LocalDateTime.now();
        }
        if (followDate == null) {
            followDate = LocalDateTime.now();
        }
    }
}
```

---

## 4. Job Module

### Job
```java
package com.iting.jobportal.job.entity;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "Job",
        indexes = {
                @Index(name = "idx_job_company", columnList = "Company_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Company_id", nullable = false)
    private Company company;

    @Column(name = "Position", length = 255)
    private String position;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Tech_required", columnDefinition = "TEXT")
    private String techRequired;

    @Enumerated(EnumType.STRING)
    @Column(name = "Job_type", length = 50)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "Experience_level", length = 50)
    private ExperienceLevel experienceLevel;

    @Column(name = "Min_salary", precision = 15, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "Max_salary", precision = 15, scale = 2)
    private BigDecimal maxSalary;

    @Column(name = "Min_accept", columnDefinition = "TEXT")
    private String minAccept;

    @Column(name = "Max_accept")
    private Integer maxAccept;

    @Column(name = "Current_accepted")
    private Integer currentAccepted;


    @Column(name = "View_count")
    private Integer viewCount;

    @Column(name = "Application_count")
    private Integer applicationCount;

    @Column(name = "Featured")
    private Boolean featured;

    @Column(name = "Review_reason", columnDefinition = "TEXT")
    private String reviewReason;

    @Column(name = "Reviewed_by")
    private Long reviewedBy;

    @Column(name = "Reviewed_at")
    private LocalDateTime reviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 50)
    private JobStatus status;

    @Column(name = "Due_date")
    private LocalDate dueDate;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Column(name = "Location", length = 255)
    private String location;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Job_embedding", columnDefinition = "TEXT")
    private String jobEmbedding;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = JobStatus.DRAFT;
        }
        if (lastUpdate == null) {
            lastUpdate = LocalDateTime.now();
        }

        if (viewCount == null) viewCount = 0;
        if (applicationCount == null) applicationCount = 0;
        if (currentAccepted == null) currentAccepted = 0;
        if (maxAccept == null) maxAccept = 0;

        if (featured == null) featured = false;
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdate = LocalDateTime.now();
    }
}
```

### CompanyUploadJob
```java
package com.iting.jobportal.job.entity;

import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.company.entity.Company;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Company_upload_job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyUploadJob {

    @EmbeddedId
    private CompanyUploadJobId id; // Khóa chính tổ hợp (JobId + CompanyId)

    @ManyToOne
    @MapsId("jobId")
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @MapsId("companyId")
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin approvedBy; // Admin nào đã duyệt/thực hiện upload

    @Column(name = "time")
    private LocalDateTime uploadTime;

    @Column(name = "status")
    private String status;

    @Column(name = "note")
    private String note;
}
```

---

## 5. Company Module

### Company
```java
package com.iting.jobportal.company.entity;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.job.entity.Job;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Company")
@Getter
@Setter
public class Company {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "company_id")
    private Account account;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    private List<Job> jobs;

    // ===== Thông tin cơ bản =====
    @Column(name = "Name", nullable = false, length = 255)
    private String name;

    @Column(name = "Web_link", columnDefinition = "TEXT")
    private String website;

    @Column(name = "Address", length = 500)
    private String address;

    @Column(name = "Logo", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Company_email", length = 255)
    private String companyEmail;

    @Column(name = "Industry", length = 255)
    private String industry;

    @Column(name = "Company_size", length = 100)
    private String companySize;

    @Column(name = "Phone", length = 20)
    private String phone;

    // ===== Thông tin người đại diện =====
    @Column(name = "Representative_name", length = 255)
    private String representativeName;

    @Column(name = "Representative_gender", length = 10)
    private String representativeGender;

    @Column(name = "Representative_phone", length = 20)
    private String representativePhone;

    @Column(name = "Account_email", length = 255)
    private String accountEmail;

    // ===== Thông tin pháp lý =====
    @Column(name = "Tax_code", length = 50)
    private String taxCode;

    @Column(name = "Business_license_file_url", columnDefinition = "TEXT")
    private String businessLicenseFileUrl;

    @Column(name = "Consent_document_file_url", columnDefinition = "TEXT")
    private String consentDocumentFileUrl;

    // ===== Xác thực =====
    @Enumerated(EnumType.STRING)
    @Column(name = "Verification_level", length = 50)
    private VerificationLevel verificationLevel = VerificationLevel.UNVERIFIED;

    @Enumerated(EnumType.STRING)
    @Column(name = "Company_info_update_status", length = 50)
    private CompanyReviewStatus companyInfoUpdateStatus = CompanyReviewStatus.DRAFT;

    @Column(name = "Last_update_request_date")
    private LocalDateTime lastUpdateRequestDate;

    // ===== Hệ thống =====
    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Column(name = "Active")
    private Boolean active = true;

    @Column(name = "follower_count")
    private Long followerCount;

    public Company() {
    }
}
```

---

## 6. Application Module

### ApplyFormSentToJob
```java
package com.iting.jobportal.application.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "Apply_form_user_to_job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyFormSentToJob {

    @EmbeddedId
    private ApplyFormSentToJobId id;

    @Column(name = "Time_sent")
    private LocalDateTime timeSent;

    @PrePersist
    protected void onCreate() {
        if (timeSent == null) {
            timeSent = LocalDateTime.now();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class ApplyFormSentToJobId implements Serializable {

        @Column(name = "Job_id", nullable = false)
        private Long jobId;

        @Column(name = "Apply_form_id", nullable = false)
        private Long applyFormId;
    }
}
```

### ApplyForm
```java
package com.iting.jobportal.application.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Apply_form")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "User_id", nullable = false, length = 255)
    private Long userId;

    @Column(name = "Cv_title", length = 255)
    private String cvTitle;

    @Column(name = "Applicant_name", length = 255)
    private String applicantName;

    @Column(name = "Introduction", columnDefinition = "TEXT")
    private String introduction;
}
```

---

## 7. Auth Module

### Account
```java
package com.iting.jobportal.auth.entity;

import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Account")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;


    @Column(name = "Email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "Password", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false, length = 20)
    private Role role = Role.CANDIDATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private AccountStatus status = AccountStatus.ACTIVE;
}
```

### BanHistory
```java
package com.iting.jobportal.auth.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ban_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_account_id", nullable = false)
    private Account targetAccount; // Tài khoản bị cấm

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_account_id", nullable = false)
    private Account adminAccount; // Admin thực hiện lệnh cấm

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime bannedAt;
    private LocalDateTime expiredAt; // NULL nếu cấm vĩnh viễn

    @Column(nullable = false)
    private Boolean isActive = true; // Lệnh cấm này còn hiệu lực hay không

    @PrePersist
    protected void onCreate() {
        bannedAt = LocalDateTime.now();
    }
}
```

### RefreshToken
```java
package com.iting.jobportal.auth.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class RefreshToken extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_id", unique = true, nullable = false)
    private String tokenId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "token", nullable = false, columnDefinition = "TEXT")
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "ip_address")
    private String ipAddress;

    // Utility methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !isUsed && !isRevoked && !isExpired();
    }

    public void revoke() {
        this.isRevoked = true;
    }

    public void markAsUsed() {
        this.isUsed = true;
    }
}
```

---

## 8. Admin Module

### Admin
```java
package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @Column(name = "id")
    private Long id;  // ID này sẽ trùng với Account ID

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "login_count")
    private Integer loginCount = 0;

    @Column(name = "last_login_ip", length = 50)
    private String lastLoginIp;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (loginCount == null) loginCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### UserReport
```java
package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class UserReport extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reporterId;  // Người báo cáo

    @Column(nullable = false)
    private Long reportedUserId;  // Người bị báo cáo

    @Column(nullable = false, length = 50)
    private String type;  // SPAM, HARASSMENT, FAKE_INFO, SCAM, OTHER

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(length = 1000)
    private String description;

    @Column(length = 50)
    private String status;  // PENDING, REVIEWING, RESOLVED, DISMISSED

    @Column(length = 1000)
    private String adminNote;

    private Long handledBy;  // Admin xử lý

    private LocalDateTime handledAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "PENDING";
    }
}
```

### StaticContent
```java
package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "static_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class StaticContent extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String slug;  // about, faq, terms, privacy, blog-xxx

    @Column(nullable = false, length = 50)
    private String type;  // PAGE, FAQ, BLOG

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 255)
    private String metaDescription;

    @Column(length = 255)
    private String metaKeywords;

    @Column(length = 500)
    private String thumbnailUrl;

    private Boolean published;

    private Integer sortOrder;

    private Long authorId;

    private Long viewCount;

    private LocalDateTime publishedAt;

    @PrePersist
    protected void onCreate() {
        if (published == null) published = false;
        if (viewCount == null) viewCount = 0L;
        if (sortOrder == null) sortOrder = 0;
    }
}
```

### ReportAccount
```java
package com.iting.jobportal.admin.entity;

import com.iting.jobportal.admin.entity.enums.ReportStatus;
import com.iting.jobportal.admin.entity.enums.ReportType;
import com.iting.jobportal.admin.entity.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // user bị report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private com.iting.jobportal.user.entity.User reportedUser;

    // có thể là user hoặc company report, tạm để id đơn giản
    @Column(name = "reporter_id")
    private Long reporterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 30)
    private ReportType reportType; // POST, JOB, COMMENT, ACCOUNT

    @Column(name = "violation", nullable = false, length = 255)
    private String violation;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private SeverityLevel severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status; // PENDING, RESOLVED, REJECTED

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by")
    private Admin handledBy;

    @Column(name = "handled_at")
    private LocalDateTime handledAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = ReportStatus.PENDING;
    }
}
```

### Category
```java
package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Category extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;  // INDUSTRY, SKILL, LOCATION

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String nameEn;  // English name for internationalization

    @Column(length = 255)
    private String description;

    @Column(length = 500)
    private String icon;  // Icon class or image path

    private Long parentId;  // Cho category phân cấp

    private Integer sortOrder;

    private Boolean active;

    @PrePersist
    protected void onCreate() {
        if (active == null) active = true;
        if (sortOrder == null) sortOrder = 0;
    }
}
```

### ActivityLog
```java
package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class ActivityLog extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(length = 100)
    private String entityType;

    private Long entityId;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 255)
    private String userAgent;
}
```

---

## 9. Common Module

### AuditEntity
```java
package com.iting.jobportal.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class AuditEntity {

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```
