package com.iting.jobportal.messaging.service;

import com.iting.jobportal.messaging.dto.response.ConversationListResponse;
import com.iting.jobportal.messaging.dto.response.ConversationResponse;
import com.iting.jobportal.messaging.enums.ConversationType;

public interface ConversationService {

    /**
     * Get all conversations for a user (paginated)
     * @param userId User ID
     * @param page Page number
     * @param size Page size
     * @return Paginated conversation list
     */
    ConversationListResponse getConversationsForUser(Long userId, int page, int size);

    /**
     * Get conversations by type for a user
     * @param userId User ID
     * @param type Conversation type
     * @param page Page number
     * @param size Page size
     * @return Paginated conversation list
     */
    ConversationListResponse getConversationsByType(Long userId, ConversationType type, int page, int size);

    /**
     * Get conversation by ID
     * @param conversationId Conversation ID
     * @param userId User ID (to verify access)
     * @return Conversation response
     */
    ConversationResponse getConversationById(Long conversationId, Long userId);

    /**
     * Get conversation between two participants
     * @param userId1 First participant ID
     * @param userId2 Second participant ID
     * @return Conversation response or null if not exists
     */
    ConversationResponse getConversationBetweenParticipants(Long userId1, Long userId2);

    /**
     * Get unread message count for each conversation
     * @param conversationId Conversation ID
     * @param userId User ID
     * @return Unread count
     */
    Long getUnreadCountForConversation(Long conversationId, Long userId);

    /**
     * Delete a conversation
     * @param conversationId Conversation ID
     * @param userId User ID (to verify ownership)
     */
    void deleteConversation(Long conversationId, Long userId);

    /**
     * Get total conversation count for a user
     * @param userId User ID
     * @return Total count
     */
    Long getTotalConversationCount(Long userId);
}
