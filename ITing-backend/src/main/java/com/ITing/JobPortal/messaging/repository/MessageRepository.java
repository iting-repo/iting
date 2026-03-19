package com.iting.jobportal.messaging.repository;

import com.iting.jobportal.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Get all messages in a conversation (paginated, ordered by time DESC)
     */
    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    /**
     * Get all messages in a conversation (list, ordered by time ASC for chat display)
     */
    @Query("SELECT m FROM Message m WHERE m.conversationId = :conversationId ORDER BY m.createdAt ASC")
    List<Message> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") Long conversationId);

    /**
     * Get latest message in a conversation
     */
    Message findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    /**
     * Count unread messages in a conversation for a specific receiver
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :conversationId " +
           "AND m.receiverId = :receiverId AND m.isRead = false")
    Long countUnreadByConversationIdAndReceiverId(@Param("conversationId") Long conversationId, 
                                                    @Param("receiverId") Long receiverId);

    /**
     * Count total unread messages for a user across all conversations
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    Long countUnreadByReceiverId(@Param("userId") Long userId);

    /**
     * Get all unread messages for a user
     */
    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId AND m.isRead = false " +
           "ORDER BY m.createdAt DESC")
    List<Message> findUnreadByReceiverId(@Param("userId") Long userId);

    /**
     * Mark message as read
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :readAt WHERE m.id = :messageId")
    void markAsRead(@Param("messageId") Long messageId, @Param("readAt") LocalDateTime readAt);

    /**
     * Mark all messages in a conversation as read for a specific receiver
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :readAt " +
           "WHERE m.conversationId = :conversationId AND m.receiverId = :receiverId AND m.isRead = false")
    void markAllAsReadInConversation(@Param("conversationId") Long conversationId, 
                                      @Param("receiverId") Long receiverId,
                                      @Param("readAt") LocalDateTime readAt);

    /**
     * Mark all messages as read for a user
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :readAt " +
           "WHERE m.receiverId = :userId AND m.isRead = false")
    void markAllAsReadForUser(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    /**
     * Get messages sent by a specific user
     */
    Page<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId, Pageable pageable);

    /**
     * Get messages received by a specific user
     */
    Page<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);

    /**
     * Delete all messages in a conversation
     */
    @Modifying
    @Query("DELETE FROM Message m WHERE m.conversationId = :conversationId")
    void deleteByConversationId(@Param("conversationId") Long conversationId);

    /**
     * Count messages in a conversation
     */
    Long countByConversationId(Long conversationId);

    /**
     * Get messages in a conversation within a time range
     */
    @Query("SELECT m FROM Message m WHERE m.conversationId = :conversationId " +
           "AND m.createdAt BETWEEN :startTime AND :endTime ORDER BY m.createdAt ASC")
    List<Message> findByConversationIdAndTimeRange(@Param("conversationId") Long conversationId,
                                                     @Param("startTime") LocalDateTime startTime,
                                                     @Param("endTime") LocalDateTime endTime);
}
