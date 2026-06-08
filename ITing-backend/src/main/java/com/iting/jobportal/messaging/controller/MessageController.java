package com.iting.jobportal.messaging.controller;

import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.messaging.dto.AttachmentDto;
import com.iting.jobportal.messaging.dto.LinkPreviewDto;
import com.iting.jobportal.messaging.dto.request.EditMessageRequest;
import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.response.ConversationListResponse;
import com.iting.jobportal.messaging.dto.response.ConversationResponse;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.service.ConversationService;
import com.iting.jobportal.messaging.service.LinkPreviewService;
import com.iting.jobportal.messaging.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messaging", description = "Real-time messaging APIs")
public class MessageController {

  private final MessageService messageService;
  private final ConversationService conversationService;
  private final SimpMessagingTemplate messagingTemplate;
  private final FileUploadService fileUploadService;
  private final LinkPreviewService linkPreviewService;

  /** Định dạng tệp đính kèm cho phép: ảnh, PDF, Word. */
  private static final Set<String> ALLOWED_ATTACHMENT_TYPES =
      Set.of(
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/webp",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  private static final long MAX_ATTACHMENT_BYTES = 10L * 1024 * 1024; // 10MB

  @PostMapping
  @Operation(summary = "Send a message")
  public ResponseEntity<MessageResponse> sendMessage(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @Valid @RequestBody SendMessageRequest request) {
    MessageResponse response = messageService.sendMessage(request, userId);
    messagingTemplate.convertAndSend(
        "/topic/conversation/" + response.getConversationId(), response);
    return ResponseEntity.ok(response);
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload a chat attachment (image / PDF / DOCX) → returns attachment metadata")
  public ResponseEntity<AttachmentDto> uploadAttachment(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @RequestParam("file") MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tệp trống");
    }
    if (file.getSize() > MAX_ATTACHMENT_BYTES) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Tệp vượt quá 10MB");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_ATTACHMENT_TYPES.contains(contentType.toLowerCase())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Chỉ hỗ trợ ảnh, PDF hoặc Word (DOC/DOCX)");
    }

    String original = file.getOriginalFilename();
    String ext =
        (original != null && original.contains("."))
            ? original.substring(original.lastIndexOf('.'))
            : "";
    String key = "messages/" + UUID.randomUUID() + ext;

    try {
      String url = fileUploadService.uploadBytes(file.getBytes(), key, contentType);
      return ResponseEntity.ok(
          AttachmentDto.builder()
              .url(url)
              .name(original)
              .contentType(contentType)
              .size(file.getSize())
              .viewUrl(presign(url))
              .build());
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Tải tệp lên thất bại");
    }
  }

  /** Presigned URL để xem tệp private trên S3. URL không phải S3 (local dev) thì giữ nguyên. */
  private String presign(String url) {
    if (url == null) return null;
    try {
      if (url.contains("amazonaws.com")) {
        return fileUploadService.generatePresignedUrl(url, 60 * 24); // 24h
      }
    } catch (Exception ignored) {
      // fallback: trả URL gốc
    }
    return url;
  }

  @GetMapping("/link-preview")
  @Operation(summary = "Fetch Open Graph preview for a URL (YouTube, articles...)")
  public ResponseEntity<LinkPreviewDto> linkPreview(@RequestParam("url") String url) {
    return ResponseEntity.ok(linkPreviewService.fetch(url));
  }

  @GetMapping("/conversations")
  @Operation(summary = "Get my conversations")
  public ResponseEntity<ConversationListResponse> getConversations(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) ConversationType type) {
    if (type != null) {
      return ResponseEntity.ok(
          conversationService.getConversationsByType(userId, type, page, size));
    }
    return ResponseEntity.ok(conversationService.getConversationsForUser(userId, page, size));
  }

  @GetMapping("/conversations/{conversationId}")
  @Operation(summary = "Get conversation by id")
  public ResponseEntity<ConversationResponse> getConversationById(
      @Parameter(hidden = true) @CurrentUser Long userId, @PathVariable Long conversationId) {
    return ResponseEntity.ok(conversationService.getConversationById(conversationId, userId));
  }

  @DeleteMapping("/conversations/{conversationId}")
  @Operation(summary = "Delete a conversation")
  public ResponseEntity<Map<String, String>> deleteConversation(
      @Parameter(hidden = true) @CurrentUser Long userId, @PathVariable Long conversationId) {
    conversationService.deleteConversation(conversationId, userId);
    return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
  }

  @GetMapping("/conversations/{conversationId}/messages")
  @Operation(summary = "Get messages in conversation (paginated)")
  public ResponseEntity<Page<MessageResponse>> getMessages(
      @PathVariable Long conversationId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(messageService.getMessagesByConversation(conversationId, page, size));
  }

  @GetMapping("/conversations/{conversationId}/messages/all")
  @Operation(summary = "Get all messages in conversation")
  public ResponseEntity<List<MessageResponse>> getAllMessages(@PathVariable Long conversationId) {
    return ResponseEntity.ok(messageService.getAllMessagesByConversation(conversationId));
  }

  @PatchMapping("/{messageId}/read")
  @Operation(summary = "Mark one message as read")
  public ResponseEntity<Map<String, String>> markMessageAsRead(
      @Parameter(hidden = true) @CurrentUser Long userId, @PathVariable Long messageId) {
    messageService.markMessageAsRead(messageId, userId);
    return ResponseEntity.ok(Map.of("message", "Message marked as read"));
  }

  @PutMapping("/{messageId}")
  @Operation(summary = "Edit message content (sender only, trong 24h)")
  public ResponseEntity<MessageResponse> editMessage(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @PathVariable Long messageId,
      @Valid @RequestBody EditMessageRequest request) {
    MessageResponse updated = messageService.editMessage(messageId, userId, request.getContent());
    // Broadcast cùng channel /topic/conversation/{id} — frontend check id trùng
    // trong state để update tại chỗ (thay vì append).
    messagingTemplate.convertAndSend(
        "/topic/conversation/" + updated.getConversationId(), updated);
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{messageId}")
  @Operation(summary = "Soft-delete a message (sender only)")
  public ResponseEntity<MessageResponse> deleteMessage(
      @Parameter(hidden = true) @CurrentUser Long userId, @PathVariable Long messageId) {
    messageService.deleteMessage(messageId, userId);
    MessageResponse updated = messageService.getMessageById(messageId);
    // Broadcast để clients khác trong cuộc trò chuyện thấy "Tin nhắn đã thu hồi".
    messagingTemplate.convertAndSend(
        "/topic/conversation/" + updated.getConversationId(), updated);
    return ResponseEntity.ok(updated);
  }

  @PatchMapping("/conversations/{conversationId}/read")
  @Operation(summary = "Mark all messages in conversation as read")
  public ResponseEntity<Map<String, String>> markAllAsRead(
      @Parameter(hidden = true) @CurrentUser Long userId, @PathVariable Long conversationId) {
    messageService.markAllMessagesAsReadInConversation(conversationId, userId);
    return ResponseEntity.ok(Map.of("message", "All messages marked as read"));
  }

  @GetMapping("/unread/count")
  @Operation(summary = "Get unread message count")
  public ResponseEntity<Map<String, Long>> getUnreadCount(
      @Parameter(hidden = true) @CurrentUser Long userId) {
    return ResponseEntity.ok(Map.of("unreadCount", messageService.getUnreadMessageCount(userId)));
  }

  @GetMapping("/unread")
  @Operation(summary = "Get unread messages")
  public ResponseEntity<List<MessageResponse>> getUnreadMessages(
      @Parameter(hidden = true) @CurrentUser Long userId) {
    return ResponseEntity.ok(messageService.getUnreadMessages(userId));
  }
}
