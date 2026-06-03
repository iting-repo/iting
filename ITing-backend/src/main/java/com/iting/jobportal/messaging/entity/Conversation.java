package com.iting.jobportal.messaging.entity;

import com.iting.jobportal.messaging.enums.ConversationType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 20)
  private ConversationType type;

  @Column(name = "participant1_id", nullable = false)
  private Long participant1Id;

  @Column(name = "participant2_id", nullable = false)
  private Long participant2Id;

  @Column(name = "last_message_id")
  private Long lastMessageId;

  @Column(name = "last_message_content", columnDefinition = "TEXT")
  private String lastMessageContent;

  @Column(name = "last_message_time")
  private LocalDateTime lastMessageTime;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // Transient fields for UI (not stored in database)
  @Transient private String participant1Name;

  @Transient private String participant1Avatar;

  @Transient private String participant2Name;

  @Transient private String participant2Avatar;

  @Transient private Integer unreadCount;

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    if (updatedAt == null) {
      updatedAt = LocalDateTime.now();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
