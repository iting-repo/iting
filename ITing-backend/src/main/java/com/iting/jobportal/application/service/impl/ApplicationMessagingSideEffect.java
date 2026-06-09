package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import com.iting.jobportal.messaging.service.MessageService;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Các side-effect "best-effort" (thông báo + tin nhắn tự động) cho luồng cập nhật trạng thái ứng
 * tuyển.
 *
 * <p>Mỗi side-effect chạy ở {@link Propagation#REQUIRES_NEW} — transaction RIÊNG, tách khỏi
 * transaction chính của {@code updateApplicationStatus}. Nếu side-effect lỗi (vd công ty đang bị
 * đình chỉ khiến gửi tin nhắn ném lỗi, hay recipient không hợp lệ), chỉ transaction phụ này rollback
 * và lỗi được caller nuốt — transaction chính KHÔNG bị đánh dấu rollback-only, nên việc accept/reject
 * vẫn commit thành công thay vì trả 500 ({@code UnexpectedRollbackException}).
 */
@Service
@RequiredArgsConstructor
public class ApplicationMessagingSideEffect {

  private final MessageService messageService;
  private final NotificationService notificationService;

  /** Tạo thông báo cho ứng viên khi trạng thái đổi (tx riêng, best-effort). */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void fireStatusNotification(
      Long recipientUserId, NotificationType type, String content, Long applicationId) {
    notificationService.createNotification(
        CreateNotificationRequest.builder()
            .recipientId(recipientUserId)
            .recipientType(RecipientType.USER)
            .type(type)
            .content(content)
            .entityType("APPLICATION")
            .entityId(applicationId)
            .actionUrl("/candidate/applied-jobs")
            .build());
  }

  /** Gửi tin nhắn tự động chào ứng viên khi được chấp nhận (tx riêng, best-effort). */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void sendAcceptanceMessage(Long employerCompanyId, Long candidateUserId, String jobTitle) {
    SendMessageRequest msgReq = new SendMessageRequest();
    msgReq.setReceiverId(candidateUserId);
    msgReq.setReceiverType(ReceiverType.USER);
    msgReq.setSenderType(SenderType.COMPANY);
    msgReq.setContent(
        String.format(
            "Chào bạn, hồ sơ ứng tuyển của bạn cho vị trí %s đã được chúng tôi chấp nhận. Vui lòng"
                + " phản hồi tin nhắn này để trao đổi thêm về lịch phỏng vấn nhé!",
            jobTitle));
    messageService.sendMessage(msgReq, employerCompanyId);
  }
}
