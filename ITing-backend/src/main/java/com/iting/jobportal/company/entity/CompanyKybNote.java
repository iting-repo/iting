package com.iting.jobportal.company.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "company_kyb_notes")
@Getter
@Setter
public class CompanyKybNote {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;

  @Column(name = "admin_id", nullable = false)
  private Long adminId;

  @Column(name = "note_content", columnDefinition = "TEXT", nullable = false)
  private String noteContent;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();
}
