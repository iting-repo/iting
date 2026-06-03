package com.iting.jobportal.admin.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "user_permission_overrides",
    uniqueConstraints = @UniqueConstraint(columnNames = {"account_id", "permission_key"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPermissionOverride {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Column(name = "permission_key", nullable = false, length = 100)
  private String permissionKey;

  @Column(nullable = false)
  private boolean granted;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "granted_by")
  private Account grantedBy;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    createdAt = updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
