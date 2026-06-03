package com.iting.jobportal.announcement.entity;

import com.iting.jobportal.announcement.entity.enums.AnnouncementDisplayMode;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/** Admin tạo announcement để hiển thị cho user theo route + role + thời gian. */
@Entity
@Table(name = "system_announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAnnouncement {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(name = "body_html", columnDefinition = "TEXT")
  private String bodyHtml;

  @Column(name = "image_url", length = 1000)
  private String imageUrl;

  @Enumerated(EnumType.STRING)
  @Column(name = "display_mode", nullable = false, length = 30)
  @Builder.Default
  private AnnouncementDisplayMode displayMode = AnnouncementDisplayMode.MODAL_DISMISSIBLE;

  @Column(name = "require_acknowledge", nullable = false)
  @Builder.Default
  private Boolean requireAcknowledge = false;

  /** Comma-separated: "ALL" / "CANDIDATE,EMPLOYER" / "ADMIN" ... */
  @Column(name = "target_roles", nullable = false, length = 100)
  @Builder.Default
  private String targetRoles = "ALL";

  /** JSON array các glob pattern. VD: ["/", "/jobs/*", "LOGIN"] */
  @Column(name = "trigger_routes", nullable = false, columnDefinition = "TEXT")
  @Builder.Default
  private String triggerRoutes = "[\"/\"]";

  @Column(name = "start_at")
  private LocalDateTime startAt;

  @Column(name = "end_at")
  private LocalDateTime endAt;

  @Column(nullable = false)
  @Builder.Default
  private Integer priority = 0;

  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  @Column(name = "created_by")
  private Long createdBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
