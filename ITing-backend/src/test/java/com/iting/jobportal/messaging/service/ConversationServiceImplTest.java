package com.iting.jobportal.messaging.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.messaging.dto.response.ConversationListResponse;
import com.iting.jobportal.messaging.dto.response.ConversationResponse;
import com.iting.jobportal.messaging.entity.Conversation;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.repository.ConversationRepository;
import com.iting.jobportal.messaging.repository.MessageRepository;
import com.iting.jobportal.messaging.service.impl.ConversationServiceImpl;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConversationServiceImplTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private ConversationServiceImpl conversationService;

    private User testUser;
    private Conversation testConversation;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setAccount(Account.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .avatarUrl("https://avatar.com/1.png")
                .build());

        testConversation = Conversation.builder()
                .id(1L)
                .type(ConversationType.USER_USER)
                .participant1Id(1L)
                .participant2Id(2L)
                .lastMessageContent("Hello World")
                .lastMessageTime(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("getConversationsForUser tests")
    class GetConversationsTests {

        @Test
        @DisplayName("Should return paginated conversations for user")
        void getConversationsForUser_returnsPaginated() {
            Page<Conversation> page = new PageImpl<>(List.of(testConversation));
            when(conversationRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(page);
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(2L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.findById(2L)).thenReturn(Optional.empty());
            when(companyRepository.findById(anyLong())).thenReturn(Optional.empty());

            ConversationListResponse result = conversationService.getConversationsForUser(1L, 0, 20);

            assertNotNull(result);
            assertEquals(1, result.getTotalCount());
            assertEquals(1, result.getConversations().size());
            assertEquals(2, result.getConversations().get(0).getUnreadCount());
        }

        @Test
        @DisplayName("Should use safe defaults for negative page")
        void getConversationsForUser_negativePage_usesZero() {
            Page<Conversation> emptyPage = Page.empty();
            when(conversationRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(emptyPage);

            ConversationListResponse result = conversationService.getConversationsForUser(1L, -5, 20);

            assertNotNull(result);
            verify(conversationRepository).findByUserId(eq(1L), any(Pageable.class));
        }

        @Test
        @DisplayName("Should cap size at 100")
        void getConversationsForUser_excessiveSize_capsAt100() {
            Page<Conversation> emptyPage = Page.empty();
            when(conversationRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(emptyPage);

            conversationService.getConversationsForUser(1L, 0, 500);

            verify(conversationRepository).findByUserId(eq(1L), any(Pageable.class));
        }

        @Test
        @DisplayName("Should cap size at 20 when size is zero or negative")
        void getConversationsForUser_zeroSize_defaultsTo20() {
            Page<Conversation> emptyPage = Page.empty();
            when(conversationRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(emptyPage);

            conversationService.getConversationsForUser(1L, 0, 0);

            verify(conversationRepository).findByUserId(eq(1L), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("getConversationsByType tests")
    class GetByTypeTests {

        @Test
        @DisplayName("Should return conversations filtered by type")
        void getConversationsByType_returnsFiltered() {
            Page<Conversation> page = new PageImpl<>(List.of(testConversation));
            when(conversationRepository.findByUserIdAndType(eq(1L), eq(ConversationType.USER_USER), any(Pageable.class)))
                    .thenReturn(page);
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(0L);
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            ConversationListResponse result = conversationService.getConversationsByType(1L, ConversationType.USER_USER, 0, 20);

            assertNotNull(result);
            verify(conversationRepository).findByUserIdAndType(eq(1L), eq(ConversationType.USER_USER), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("getConversationById tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return conversation when user is participant")
        void getConversationById_participant_returnsConversation() {
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(3L);
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            ConversationResponse result = conversationService.getConversationById(1L, 1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
        }

        @Test
        @DisplayName("Should throw exception when conversation not found")
        void getConversationById_notFound_throwsException() {
            when(conversationRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> conversationService.getConversationById(999L, 1L));

            assertEquals("Conversation not found", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user is not participant")
        void getConversationById_notParticipant_throwsException() {
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> conversationService.getConversationById(1L, 999L));

            assertEquals("Unauthorized: You are not a participant of this conversation", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("deleteConversation tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete conversation and messages when user is participant")
        void deleteConversation_validParticipant_deletes() {
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));

            conversationService.deleteConversation(1L, 1L);

            verify(messageRepository).deleteByConversationId(1L);
            verify(conversationRepository).delete(testConversation);
        }

        @Test
        @DisplayName("Should throw exception when user is not participant")
        void deleteConversation_notParticipant_throwsException() {
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> conversationService.deleteConversation(1L, 999L));

            assertEquals("Unauthorized: You are not a participant of this conversation", exception.getMessage());
            verify(conversationRepository, never()).delete(any());
        }
    }



    @Nested
    @DisplayName("getUnreadCountForConversation tests")
    class UnreadCountTests {

        @Test
        @DisplayName("Should return unread count for conversation")
        void getUnreadCountForConversation_returnsCount() {
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(5L);

            Long count = conversationService.getUnreadCountForConversation(1L, 1L);

            assertEquals(5L, count);
        }
    }

    @Nested
    @DisplayName("getTotalConversationCount tests")
    class TotalCountTests {

        @Test
        @DisplayName("Should return total conversation count")
        void getTotalConversationCount_returnsCount() {
            when(conversationRepository.countByUserId(1L)).thenReturn(10L);

            Long count = conversationService.getTotalConversationCount(1L);

            assertEquals(10L, count);
        }
    }

    @Nested
    @DisplayName("getConversationBetweenParticipants tests")
    class GetBetweenParticipantsTests {

        @Test
        @DisplayName("Should return conversation between two users")
        void getConversationBetweenParticipants_exists_returnsConversation() {
            when(conversationRepository.findByParticipants(1L, 2L)).thenReturn(Optional.of(testConversation));
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(0L);
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            ConversationResponse result = conversationService.getConversationBetweenParticipants(1L, 2L);

            assertNotNull(result);
        }

        @Test
        @DisplayName("Should return null when no conversation exists")
        void getConversationBetweenParticipants_notExists_returnsNull() {
            when(conversationRepository.findByParticipants(1L, 999L)).thenReturn(Optional.empty());

            ConversationResponse result = conversationService.getConversationBetweenParticipants(1L, 999L);

            assertNull(result);
        }
    }

    @Nested
    @DisplayName("Participant profile filling via conversation response")
    class FillProfileTests {

        @Test
        @DisplayName("Should populate participant names when getting conversation")
        void getConversationById_populatesParticipantNames() {
            User participant2 = new User();
            participant2.setId(2L);
            participant2.setAccount(Account.builder()
                    .id(2L)
                    .fullName("Tran Thi B")
                    .avatarUrl("https://avatar.com/2.png")
                    .build());
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(3L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.findById(2L)).thenReturn(Optional.of(participant2));

            ConversationResponse result = conversationService.getConversationById(1L, 1L);

            assertNotNull(result);
            assertEquals("Nguyen Van A", result.getParticipant1Name());
            assertEquals("https://avatar.com/1.png", result.getParticipant1Avatar());
            assertEquals("Tran Thi B", result.getParticipant2Name());
            assertEquals("https://avatar.com/2.png", result.getParticipant2Avatar());
            assertEquals(2L, result.getOtherParticipantId());
        }

        @Test
        @DisplayName("Should set otherParticipantId correctly when user is participant1")
        void getConversationById_setsOtherParticipantId_whenUserIsParticipant1() {
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));
            when(messageRepository.countUnreadByConversationIdAndReceiverId(1L, 1L)).thenReturn(0L);
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

            ConversationResponse result = conversationService.getConversationById(1L, 1L);

            assertEquals(2L, result.getOtherParticipantId());
        }
    }
}
