package com.iting.jobportal.notification.entity;

import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

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

  // private Long id;

  @Column(name = "content", columnDefinition = "TEXT")
  private String content;

  @Column(name = "time")
  private LocalDateTime time;

  // New fields added for enhanced notification system
  @Column(name = "recipient_id", nullable = false)
  private Long recipientId;

  @Enumerated(EnumType.STRING)
  @Column(name = "recipient_type", nullable = false, length = 20)
  private RecipientType recipientType;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 50)
  private NotificationType type;

  @Column(name = "is_read", nullable = false)
  private Boolean isRead = false;

  @Column(name = "read_at")
  private LocalDateTime readAt;

  @Column(name = "entity_type", length = 50)
  private String entityType;

  @Column(name = "entity_id")
  private Long entityId;

  @Column(name = "action_url", length = 255)
  private String actionUrl;

  @PrePersist
  protected void onCreate() {
    if (time == null) {
      time = LocalDateTime.now();
    }
    if (isRead == null) {
      isRead = false;
    }
  }
}
