package com.iting.jobportal.messaging.dto.request;

import com.iting.jobportal.messaging.dto.AttachmentDto;
import com.iting.jobportal.messaging.dto.LinkPreviewDto;
import com.iting.jobportal.messaging.enums.MessageType;
import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
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

  // content có thể trống khi gửi sticker hoặc chỉ đính kèm tệp.
  // Service validate: phải có ít nhất 1 trong content / attachments / stickerUrl.
  private String content;

  /** TEXT (mặc định) | IMAGE | FILE | STICKER. Nếu null, service tự suy ra. */
  private MessageType messageType;

  private List<AttachmentDto> attachments;

  private LinkPreviewDto linkPreview;

  private String stickerUrl;

  // Optional: for creating new conversations
  private Long conversationId;
}
