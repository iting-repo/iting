package com.iting.jobportal.messaging.repository;

import com.iting.jobportal.messaging.entity.Conversation;
import com.iting.jobportal.messaging.enums.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

       /**
        * Find conversation between two participants (order-independent)
        * Works for both USER_USER and USER_COMPANY conversations
        */
       @Query("SELECT c FROM Conversation c WHERE " +
                     "(c.participant1Id = :userId1 AND c.participant2Id = :userId2) OR " +
                     "(c.participant1Id = :userId2 AND c.participant2Id = :userId1)")
       Optional<Conversation> findByParticipants(@Param("userId1") Long userId1,
                     @Param("userId2") Long userId2);

       /**
        * Find conversation by participants and type
        */
       @Query("SELECT c FROM Conversation c WHERE c.type = :type AND " +
                     "((c.participant1Id = :userId1 AND c.participant2Id = :userId2) OR " +
                     "(c.participant1Id = :userId2 AND c.participant2Id = :userId1))")
       Optional<Conversation> findByParticipantsAndType(@Param("userId1") Long userId1,
                     @Param("userId2") Long userId2,
                     @Param("type") ConversationType type);

       /**
        * Get all conversations for a user (paginated, ordered by last message time)
        */
       @Query("SELECT c FROM Conversation c WHERE " +
                     "c.participant1Id = :userId OR c.participant2Id = :userId " +
                     "ORDER BY c.lastMessageTime DESC")
       Page<Conversation> findByUserId(@Param("userId") Long userId, Pageable pageable);

       /**
        * Get all conversations for a user filtered by type
        */
       @Query("SELECT c FROM Conversation c WHERE " +
                     "(c.participant1Id = :userId OR c.participant2Id = :userId) AND c.type = :type " +
                     "ORDER BY c.lastMessageTime DESC")
       Page<Conversation> findByUserIdAndType(@Param("userId") Long userId,
                     @Param("type") ConversationType type,
                     Pageable pageable);

       /**
        * Count conversations for a user
        */
       @Query("SELECT COUNT(c) FROM Conversation c WHERE " +
                     "c.participant1Id = :userId OR c.participant2Id = :userId")
       Long countByUserId(@Param("userId") Long userId);

       /**
        * Check if conversation exists between two participants
        */
       @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Conversation c WHERE " +
                     "(c.participant1Id = :userId1 AND c.participant2Id = :userId2) OR " +
                     "(c.participant1Id = :userId2 AND c.participant2Id = :userId1)")
       boolean existsByParticipants(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
