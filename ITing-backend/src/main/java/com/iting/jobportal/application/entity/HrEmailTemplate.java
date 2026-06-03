package com.iting.jobportal.application.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/**
 * Reusable email templates for HR communication (interview invite, offer, reject).
 *
 * <p>Body supports placeholders: {@code {{candidate_name}}, {{job_title}}, {{company_name}},
 * {{hr_name}}}.
 *
 * <p>System-wide defaults have {@code company_id = NULL}; company-specific overrides have an ID.
 */
@Entity
@Table(name = "hr_email_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrEmailTemplate {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** NULL = system default available to all companies. */
  @Column(name = "company_id")
  private Long companyId;

  @Column(name = "name", nullable = false, length = 150)
  private String name;

  /** INTERVIEW_INVITE | OFFER | REJECT | THANK_YOU | CUSTOM */
  @Column(name = "template_type", nullable = false, length = 50)
  private String templateType;

  @Column(name = "subject", nullable = false, length = 255)
  private String subject;

  @Column(name = "body", nullable = false, columnDefinition = "TEXT")
  private String body;

  @Column(name = "is_default", nullable = false)
  @Builder.Default
  private Boolean isDefault = false;

  @Column(name = "created_by")
  private Long createdBy;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    if (createdAt == null) createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
