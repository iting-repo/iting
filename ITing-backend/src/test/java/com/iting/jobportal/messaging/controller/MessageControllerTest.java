package com.iting.jobportal.messaging.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.response.ConversationListResponse;
import com.iting.jobportal.messaging.dto.response.ConversationResponse;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.service.ConversationService;
import com.iting.jobportal.messaging.service.MessageService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

  @Mock private MessageService messageService;
  @Mock private ConversationService conversationService;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @InjectMocks private MessageController controller;

  @Test
  void sendMessage_savesAndBroadcastsToConversationTopic() {
    SendMessageRequest req = new SendMessageRequest();
    MessageResponse saved = MessageResponse.builder().conversationId(42L).build();
    when(messageService.sendMessage(req, 1L)).thenReturn(saved);

    ResponseEntity<MessageResponse> resp = controller.sendMessage(1L, req);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(saved, resp.getBody());
    verify(messagingTemplate).convertAndSend("/topic/conversation/42", saved);
  }

  @Test
  void getConversations_withType_callsByType() {
    ConversationListResponse list = new ConversationListResponse();
    when(conversationService.getConversationsByType(1L, ConversationType.USER_COMPANY, 0, 20))
        .thenReturn(list);

    assertSame(
        list, controller.getConversations(1L, 0, 20, ConversationType.USER_COMPANY).getBody());
    verify(conversationService, never())
        .getConversationsForUser(
            org.mockito.ArgumentMatchers.anyLong(),
            org.mockito.ArgumentMatchers.anyInt(),
            org.mockito.ArgumentMatchers.anyInt());
  }

  @Test
  void getConversations_noType_callsForUser() {
    ConversationListResponse list = new ConversationListResponse();
    when(conversationService.getConversationsForUser(1L, 0, 20)).thenReturn(list);

    assertSame(list, controller.getConversations(1L, 0, 20, null).getBody());
  }

  @Test
  void getConversationById_delegatesToService() {
    ConversationResponse expected = new ConversationResponse();
    when(conversationService.getConversationById(42L, 1L)).thenReturn(expected);

    assertSame(expected, controller.getConversationById(1L, 42L).getBody());
  }

  @Test
  void deleteConversation_callsService_returnsMessage() {
    ResponseEntity<Map<String, String>> resp = controller.deleteConversation(1L, 42L);

    verify(conversationService).deleteConversation(42L, 1L);
    assertEquals("Conversation deleted successfully", resp.getBody().get("message"));
  }

  @Test
  void getMessages_paginatedFromService() {
    Page<MessageResponse> page = new PageImpl<>(List.of());
    when(messageService.getMessagesByConversation(42L, 0, 20)).thenReturn(page);

    assertSame(page, controller.getMessages(42L, 0, 20).getBody());
  }

  @Test
  void getAllMessages_delegatesToService() {
    List<MessageResponse> msgs = List.of();
    when(messageService.getAllMessagesByConversation(42L)).thenReturn(msgs);

    assertSame(msgs, controller.getAllMessages(42L).getBody());
  }

  @Test
  void markMessageAsRead_callsService() {
    ResponseEntity<Map<String, String>> resp = controller.markMessageAsRead(1L, 5L);

    verify(messageService).markMessageAsRead(5L, 1L);
    assertEquals("Message marked as read", resp.getBody().get("message"));
  }

  @Test
  void markAllAsRead_callsService() {
    ResponseEntity<Map<String, String>> resp = controller.markAllAsRead(1L, 42L);

    verify(messageService).markAllMessagesAsReadInConversation(42L, 1L);
    assertEquals("All messages marked as read", resp.getBody().get("message"));
  }

  @Test
  void getUnreadCount_wrapsCountInMap() {
    when(messageService.getUnreadMessageCount(1L)).thenReturn(7L);

    ResponseEntity<Map<String, Long>> resp = controller.getUnreadCount(1L);

    assertEquals(7L, resp.getBody().get("unreadCount"));
  }

  @Test
  void getUnreadMessages_delegatesToService() {
    List<MessageResponse> unread = List.of();
    when(messageService.getUnreadMessages(1L)).thenReturn(unread);

    assertSame(unread, controller.getUnreadMessages(1L).getBody());
  }
}
