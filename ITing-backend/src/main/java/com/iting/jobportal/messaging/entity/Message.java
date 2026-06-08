package com.iting.jobportal.messaging.entity;

import com.iting.jobportal.messaging.dto.AttachmentDto;
import com.iting.jobportal.messaging.dto.LinkPreviewDto;
import com.iting.jobportal.messaging.entity.converter.AttachmentListJsonConverter;
import com.iting.jobportal.messaging.entity.converter.LinkPreviewJsonConverter;
import com.iting.jobportal.messaging.enums.MessageType;
import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "conversation_id", nullable = false)
  private Long conversationId;

  @Column(name = "sender_id", nullable = false)
  private Long senderId;

  @Enumerated(EnumType.STRING)
  @Column(name = "sender_type", nullable = false, length = 20)
  private SenderType senderType;

  @Column(name = "receiver_id", nullable = false)
  private Long receiverId;

  @Enumerated(EnumType.STRING)
  @Column(name = "receiver_type", nullable = false, length = 20)
  private ReceiverType receiverType;

  // content có thể null khi tin nhắn chỉ gồm sticker / file đính kèm không kèm caption.
  @Column(name = "content", columnDefinition = "TEXT")
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(name = "message_type", nullable = false, length = 20)
  @Builder.Default
  private MessageType messageType = MessageType.TEXT;

  /** Danh sách tệp đính kèm (ảnh / PDF / DOCX). Lưu JSON. */
  @Convert(converter = AttachmentListJsonConverter.class)
  @Column(name = "attachments", columnDefinition = "TEXT")
  private List<AttachmentDto> attachments;

  /** Thẻ xem trước Open Graph cho URL đầu tiên trong nội dung. Lưu JSON. */
  @Convert(converter = LinkPreviewJsonConverter.class)
  @Column(name = "link_preview", columnDefinition = "TEXT")
  private LinkPreviewDto linkPreview;

  /** URL ảnh sticker (khi messageType = STICKER). */
  @Column(name = "sticker_url", length = 500)
  private String stickerUrl;

  @Column(name = "is_read", nullable = false)
  private Boolean isRead = false;

  @Column(name = "read_at")
  private LocalDateTime readAt;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  // Soft delete: giữ message trong DB nhưng UI hiển thị "Tin nhắn đã thu hồi".
  // Lý do soft delete: WebSocket có thể đã broadcast id này ra client khác,
  // hard delete sẽ làm họ thấy missing message ngẫu nhiên.
  @Builder.Default
  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted = false;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Builder.Default
  @Column(name = "is_edited", nullable = false)
  private Boolean isEdited = false;

  @Column(name = "edited_at")
  private LocalDateTime editedAt;

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    if (isRead == null) {
      isRead = false;
    }
    if (isDeleted == null) {
      isDeleted = false;
    }
    if (isEdited == null) {
      isEdited = false;
    }
    if (messageType == null) {
      messageType = MessageType.TEXT;
    }
  }
}
