package com.iting.jobportal.messaging.dto.request;

import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

  @NotNull(message = "Receiver ID is required")
  private Long receiverId;

  @NotNull(message = "Receiver type is required")
  private ReceiverType receiverType;

  @NotNull(message = "Sender type is required")
  private SenderType senderType;

  @NotBlank(message = "Message content cannot be empty")
  private String content;

  // Optional: for creating new conversations
  private Long conversationId;
}
