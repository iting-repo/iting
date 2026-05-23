package com.iting.jobportal.messaging.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import com.iting.jobportal.messaging.entity.Conversation;
import com.iting.jobportal.messaging.entity.Message;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import com.iting.jobportal.messaging.repository.ConversationRepository;
import com.iting.jobportal.messaging.repository.MessageRepository;
import com.iting.jobportal.messaging.service.event.DomainNotificationPublisher;
import com.iting.jobportal.messaging.service.impl.MessageServiceImpl;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceImplTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private DomainNotificationPublisher domainNotificationPublisher;

    @InjectMocks
    private MessageServiceImpl messageService;

    private User testUser;
    private Company testCompany;
    private Conversation testConversation;
    private Message testMessage;
    private SendMessageRequest sendRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setAccount(Account.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .avatarUrl("https://avatar.com/1.png")
                .build());

        testCompany = new Company();
        testCompany.setId(2L);
        testCompany.setName("FPT Software");
        testCompany.setLogoUrl("https://logo.com/fpt.png");

        testConversation = Conversation.builder()
                .id(1L)
                .type(ConversationType.USER_USER)
                .participant1Id(1L)
                .participant2Id(2L)
                .lastMessageContent("Hello")
                .lastMessageTime(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        testMessage = Message.builder()
                .id(1L)
                .conversationId(1L)
                .senderId(1L)
                .senderType(SenderType.USER)
                .receiverId(2L)
                .receiverType(ReceiverType.USER)
                .content("Hello World")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        sendRequest = new SendMessageRequest();
        sendRequest.setReceiverId(2L);
        sendRequest.setReceiverType(ReceiverType.USER);
        sendRequest.setSenderType(SenderType.USER);
        sendRequest.setContent("Hello World");
    }

    @Nested
    @DisplayName("sendMessage tests")
    class SendMessageTests {

        @Test
        @DisplayName("Should send message to existing conversation")
        void sendMessage_existingConversation_success() {
            sendRequest.setConversationId(1L);

            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
                Message m = inv.getArgument(0);
                m.setId(1L);
                m.setCreatedAt(LocalDateTime.now());
                return m;
            });
            when(conversationRepository.save(any(Conversation.class))).thenReturn(testConversation);

            MessageResponse response = messageService.sendMessage(sendRequest, 1L);

            assertNotNull(response);
            assertEquals(1L, response.getConversationId());
            assertEquals("Hello World", response.getContent());
            assertFalse(response.getIsRead());
            verify(conversationRepository).findById(1L);
            verify(messageRepository).save(any(Message.class));
            verify(domainNotificationPublisher).notifyUser(eq(2L), eq(NotificationType.MESSAGE_NEW), anyString(), anyString(), anyLong(), anyString());
        }

        @Test
        @DisplayName("Should create new conversation when conversationId is null")
        void sendMessage_newConversation_createsConversation() {
            when(conversationRepository.findByParticipantsAndType(1L, 2L, ConversationType.USER_USER))
                    .thenReturn(Optional.empty());
            when(conversationRepository.saveAndFlush(any(Conversation.class))).thenAnswer(inv -> {
                Conversation c = inv.getArgument(0);
                c.setId(5L);
                c.setCreatedAt(LocalDateTime.now());
                return c;
            });
            when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
                Message m = inv.getArgument(0);
                m.setId(1L);
                m.setCreatedAt(LocalDateTime.now());
                return m;
            });

            MessageResponse response = messageService.sendMessage(sendRequest, 1L);

            assertNotNull(response);
            verify(conversationRepository).findByParticipantsAndType(1L, 2L, ConversationType.USER_USER);
            verify(conversationRepository).saveAndFlush(any(Conversation.class));
            verify(conversationRepository).save(any(Conversation.class));
        }

        @Test
        @DisplayName("Should throw exception when conversation not found")
        void sendMessage_conversationNotFound_throwsException() {
            sendRequest.setConversationId(999L);
            when(conversationRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> messageService.sendMessage(sendRequest, 1L));

            assertEquals("Conversation not found", exception.getMessage());
        }

        @Test
        @DisplayName("Should notify company when receiverType is COMPANY")
        void sendMessage_companyReceiver_notifiesCompany() {
            sendRequest.setReceiverType(ReceiverType.COMPANY);
            sendRequest.setReceiverId(2L);
            sendRequest.setConversationId(null);

            when(conversationRepository.findByParticipantsAndType(1L, 2L, ConversationType.USER_COMPANY))
                    .thenReturn(Optional.empty());
            when(conversationRepository.saveAndFlush(any(Conversation.class))).thenAnswer(inv -> {
                Conversation c = inv.getArgument(0);
                c.setId(5L);
                c.setCreatedAt(LocalDateTime.now());
                return c;
            });
            when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(companyRepository.findById(2L)).thenReturn(Optional.of(testCompany));
            when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
                Message m = inv.getArgument(0);
                m.setId(1L);
                m.setCreatedAt(LocalDateTime.now());
                return m;
            });

            messageService.sendMessage(sendRequest, 1L);

            verify(domainNotificationPublisher).notifyCompany(eq(2L), eq(NotificationType.MESSAGE_NEW), anyString(), anyString(), anyLong(), anyString());
        }

        @Test
        @DisplayName("Should truncate long content in notification")
        void sendMessage_longContent_truncatesInNotification() {
            String longContent = "A".repeat(200);
            sendRequest.setContent(longContent);
            sendRequest.setConversationId(1L);

            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
            when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
                Message m = inv.getArgument(0);
                m.setId(1L);
                m.setCreatedAt(LocalDateTime.now());
                return m;
            });
            when(conversationRepository.save(any(Conversation.class))).thenReturn(testConversation);

            messageService.sendMessage(sendRequest, 1L);

            ArgumentCaptor<String> contentCaptor = ArgumentCaptor.forClass(String.class);
            verify(domainNotificationPublisher).notifyUser(anyLong(), any(), contentCaptor.capture(), any(), any(), any());

            String capturedContent = contentCaptor.getValue();
            assertTrue(capturedContent.contains("..."));
            assertTrue(capturedContent.startsWith("New message from "));
            assertEquals(154, capturedContent.length());
        }

        @Test
        @DisplayName("Should use existing conversation when found by participants")
        void sendMessage_existingConversationFound_reusesConversation() {
            when(conversationRepository.findByParticipantsAndType(1L, 2L, ConversationType.USER_USER))
                    .thenReturn(Optional.of(testConversation));
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
                Message m = inv.getArgument(0);
                m.setId(1L);
                m.setCreatedAt(LocalDateTime.now());
                return m;
            });
            when(conversationRepository.save(any(Conversation.class))).thenReturn(testConversation);

            messageService.sendMessage(sendRequest, 1L);

            verify(conversationRepository).findByParticipantsAndType(1L, 2L, ConversationType.USER_USER);
            verify(messageRepository).save(any(Message.class));
        }
    }

    @Nested
    @DisplayName("getMessagesByConversation tests")
    class GetMessagesTests {

        @Test
        @DisplayName("Should return paginated messages")
        void getMessagesByConversation_returnsPaginated() {
            Page<Message> messagePage = new PageImpl<>(List.of(testMessage));
            when(messageRepository.findByConversationIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class)))
                    .thenReturn(messagePage);
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            Page<MessageResponse> result = messageService.getMessagesByConversation(1L, 0, 20);

            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            verify(messageRepository).findByConversationIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class));
        }

        @Test
        @DisplayName("Should use safe defaults for negative page")
        void getMessagesByConversation_negativePage_usesZero() {
            Page<Message> emptyPage = Page.empty();
            when(messageRepository.findByConversationIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class)))
                    .thenReturn(emptyPage);

            messageService.getMessagesByConversation(1L, -5, 20);

            verify(messageRepository).findByConversationIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class));
        }

        @Test
        @DisplayName("Should cap size at 100")
        void getMessagesByConversation_excessiveSize_capsAt100() {
            Page<Message> emptyPage = Page.empty();
            when(messageRepository.findByConversationIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class)))
                    .thenReturn(emptyPage);

            messageService.getMessagesByConversation(1L, 0, 500);

            verify(messageRepository).findByConversationIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("markMessageAsRead tests")
    class MarkAsReadTests {

        @Test
        @DisplayName("Should mark message as read when user is receiver")
        void markMessageAsRead_validReceiver_marksAsRead() {
            when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

            messageService.markMessageAsRead(1L, 2L);

            verify(messageRepository).markAsRead(eq(1L), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("Should throw exception when user is not receiver")
        void markMessageAsRead_notReceiver_throwsException() {
            when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> messageService.markMessageAsRead(1L, 999L));

            assertEquals("Unauthorized: You are not the receiver of this message", exception.getMessage());
        }

        @Test
        @DisplayName("Should not update if already read")
        void markMessageAsRead_alreadyRead_skipsUpdate() {
            testMessage.setIsRead(true);
            when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

            messageService.markMessageAsRead(1L, 2L);

            verify(messageRepository, never()).markAsRead(anyLong(), any());
        }

        @Test
        @DisplayName("Should throw exception when message not found")
        void markMessageAsRead_notFound_throwsException() {
            when(messageRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> messageService.markMessageAsRead(999L, 2L));

            assertEquals("Message not found", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("unread count and messages tests")
    class UnreadTests {

        @Test
        @DisplayName("Should return correct unread count")
        void getUnreadMessageCount_returnsCount() {
            when(messageRepository.countUnreadByReceiverId(1L)).thenReturn(5L);

            Long count = messageService.getUnreadMessageCount(1L);

            assertEquals(5L, count);
        }

        @Test
        @DisplayName("Should return unread messages")
        void getUnreadMessages_returnsMessages() {
            when(messageRepository.findUnreadByReceiverId(1L)).thenReturn(List.of(testMessage));
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            List<MessageResponse> result = messageService.getUnreadMessages(1L);

            assertEquals(1, result.size());
            assertEquals("Hello World", result.get(0).getContent());
        }
    }

    @Nested
    @DisplayName("deleteMessage tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete message when user is sender")
        void deleteMessage_validSender_deletes() {
            when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

            messageService.deleteMessage(1L, 1L);

            verify(messageRepository).delete(testMessage);
        }

        @Test
        @DisplayName("Should throw exception when user is not sender")
        void deleteMessage_notSender_throwsException() {
            when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> messageService.deleteMessage(1L, 999L));

            assertEquals("Unauthorized: You can only delete your own messages", exception.getMessage());
        }
    }



    @Nested
    @DisplayName("getMessageById tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return message by id")
        void getMessageById_exists_returnsMessage() {
            when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            MessageResponse result = messageService.getMessageById(1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
        }

        @Test
        @DisplayName("Should throw exception when message not found")
        void getMessageById_notFound_throwsException() {
            when(messageRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> messageService.getMessageById(999L));

            assertEquals("Message not found", exception.getMessage());
        }
    }
}
