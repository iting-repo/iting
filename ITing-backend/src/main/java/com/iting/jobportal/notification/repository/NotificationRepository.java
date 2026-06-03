package com.iting.jobportal.notification.repository;

import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

  /** Get all notifications for a recipient (paginated, ordered by time DESC) */
  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.recipientType ="
          + " :recipientType ORDER BY n.time DESC")
  Page<Notification> findByRecipientIdAndRecipientType(
      @Param("recipientId") Long recipientId,
      @Param("recipientType") RecipientType recipientType,
      Pageable pageable);

  /** Get all notifications for a recipient */
  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.recipientType ="
          + " :recipientType ORDER BY n.time DESC")
  List<Notification> findByRecipientIdAndRecipientType(
      @Param("recipientId") Long recipientId, @Param("recipientType") RecipientType recipientType);

  /** Get unread notifications for a recipient (paginated) */
  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.recipientType ="
          + " :recipientType AND n.isRead = false ORDER BY n.time DESC")
  Page<Notification> findUnreadByRecipientIdAndRecipientType(
      @Param("recipientId") Long recipientId,
      @Param("recipientType") RecipientType recipientType,
      Pageable pageable);

  /** Get unread notifications for a recipient (list) */
  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.recipientType ="
          + " :recipientType AND n.isRead = false ORDER BY n.time DESC")
  List<Notification> findUnreadByRecipientIdAndRecipientType(
      @Param("recipientId") Long recipientId, @Param("recipientType") RecipientType recipientType);

  /** Count unread notifications for a recipient */
  @Query(
      "SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :recipientId "
          + "AND n.recipientType = :recipientType AND n.isRead = false")
  Long countUnreadByRecipientIdAndRecipientType(
      @Param("recipientId") Long recipientId, @Param("recipientType") RecipientType recipientType);

  /** Get notifications by type for a recipient */
  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.recipientType ="
          + " :recipientType AND n.type = :type ORDER BY n.time DESC")
  Page<Notification> findByRecipientIdAndRecipientTypeAndType(
      @Param("recipientId") Long recipientId,
      @Param("recipientType") RecipientType recipientType,
      @Param("type") NotificationType type,
      Pageable pageable);

  /** Mark notification as read */
  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :notificationId")
  void markAsRead(
      @Param("notificationId") Integer notificationId, @Param("readAt") LocalDateTime readAt);

  /** Mark all notifications as read for a recipient */
  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipientId ="
          + " :recipientId AND n.recipientType = :recipientType AND n.isRead = false")
  void markAllAsReadForRecipient(
      @Param("recipientId") Long recipientId,
      @Param("recipientType") RecipientType recipientType,
      @Param("readAt") LocalDateTime readAt);

  /** Đánh dấu notification về chưa đọc — set isRead=false và xoá readAt. */
  @Modifying
  @Query("UPDATE Notification n SET n.isRead = false, n.readAt = null WHERE n.id = :notificationId")
  void markAsUnread(@Param("notificationId") Integer notificationId);

  /** Bulk đánh dấu tất cả notifications của recipient về chưa đọc. */
  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = false, n.readAt = null WHERE n.recipientId ="
          + " :recipientId AND n.recipientType = :recipientType AND n.isRead = true")
  void markAllAsUnreadForRecipient(
      @Param("recipientId") Long recipientId,
      @Param("recipientType") RecipientType recipientType);

  /** Delete old read notifications (cleanup) */
  @Modifying
  @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.readAt < :cutoffDate")
  void deleteOldReadNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

  /** Get notifications by entity (e.g., all notifications for a specific job) */
  @Query(
      "SELECT n FROM Notification n WHERE n.entityType = :entityType AND n.entityId = :entityId "
          + "ORDER BY n.time DESC")
  List<Notification> findByEntityTypeAndEntityId(
      @Param("entityType") String entityType, @Param("entityId") Long entityId);

  /** Get recent notifications (last N days) */
  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.recipientType ="
          + " :recipientType AND n.time >= :startDate ORDER BY n.time DESC")
  List<Notification> findRecentByRecipientIdAndRecipientType(
      @Param("recipientId") Long recipientId,
      @Param("recipientType") RecipientType recipientType,
      @Param("startDate") LocalDateTime startDate);
}
