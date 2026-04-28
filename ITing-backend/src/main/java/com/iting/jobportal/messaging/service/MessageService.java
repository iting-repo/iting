package com.iting.jobportal.messaging.service;

import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MessageService {

    /**
     * Send a message
     * @param request Message request
     * @param senderId Sender ID (from @CurrentUser)
     * @return Created message
     */
    MessageResponse sendMessage(SendMessageRequest request, Long senderId);

    /**
     * Get messages in a conversation (paginated)
     * @param conversationId Conversation ID
     * @param page Page number
     * @param size Page size
     * @return Page of messages
     */
    Page<MessageResponse> getMessagesByConversation(Long conversationId, int page, int size);

    /**
     * Get messages in a conversation (all, for chat display)
     * @param conversationId Conversation ID
     * @return List of messages
     */
    List<MessageResponse> getAllMessagesByConversation(Long conversationId);

    /**
     * Mark a message as read
     * @param messageId Message ID
     * @param userId User ID (to verify it's the receiver)
     */
    void markMessageAsRead(Long messageId, Long userId);

    /**
     * Mark all messages in a conversation as read
     * @param conversationId Conversation ID
     * @param userId User ID (receiver)
     */
    void markAllMessagesAsReadInConversation(Long conversationId, Long userId);

    /**
     * Get unread message count for a user
     * @param userId User ID
     * @return Unread count
     */
    Long getUnreadMessageCount(Long userId);

    /**
     * Get unread messages for a user
     * @param userId User ID
     * @return List of unread messages
     */
    List<MessageResponse> getUnreadMessages(Long userId);

    /**
     * Delete a message (soft delete or actual delete)
     * @param messageId Message ID
     * @param userId User ID (to verify ownership)
     */
    void deleteMessage(Long messageId, Long userId);

    /**
     * Get message by ID
     * @param messageId Message ID
     * @return Message response
     */
    MessageResponse getMessageById(Long messageId);
}
