package com.iting.jobportal.messaging.dto.response;

import com.iting.jobportal.messaging.enums.ConversationType;
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
public class ConversationResponse {

  private Long id;
  private ConversationType type;
  private Long participant1Id;
  private String participant1Name;
  private String participant1Avatar;
  private Long participant2Id;
  private String participant2Name;
  private String participant2Avatar;
  private String lastMessageContent;
  private LocalDateTime lastMessageTime;
  private Integer unreadCount;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Helper field: the other participant's info for the current user
  private Long otherParticipantId;
  private String otherParticipantName;
  private String otherParticipantAvatar;
  private Boolean otherParticipantActive;
}
