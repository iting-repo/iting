package com.iting.jobportal.messaging.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.messaging.dto.request.EditMessageRequest;
import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.response.ConversationListResponse;
import com.iting.jobportal.messaging.dto.response.ConversationResponse;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.service.ConversationService;
import com.iting.jobportal.messaging.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messaging", description = "Real-time messaging APIs")
public class MessageController {

  private final MessageService messageService;
  private final ConversationService conversationService;
  private final SimpMessagingTemplate messagingTemplate;

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
