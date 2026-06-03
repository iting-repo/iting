package com.iting.jobportal.messaging.dto.response;

import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

  private Long id;
  private Long conversationId;
  private Long senderId;
  private SenderType senderType;
  private String senderName;
  private String senderAvatar;
  private Long receiverId;
  private ReceiverType receiverType;
  private String receiverName;
  private String receiverAvatar;
  private String content;
  private Boolean isRead;
  private LocalDateTime readAt;
  private LocalDateTime createdAt;
  // Edit/delete tracking — UI hiển thị "(đã sửa)" hoặc "Tin nhắn đã thu hồi"
  private Boolean isEdited;
  private LocalDateTime editedAt;
  private Boolean isDeleted;
  private LocalDateTime deletedAt;
}
