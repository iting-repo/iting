package com.iting.jobportal.common.event.consumer;

import com.iting.jobportal.common.event.payload.KybReviewCompletedEvent;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

/**
 * Consumes KybReviewCompletedEvent from Kafka.
 * Notifies company owner about KYB verification result.
 * On unrecoverable error: DefaultErrorHandler routes to {topic}.DLT.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "spring.kafka", name = "enabled", havingValue = "true")
@Slf4j
public class KybReviewCompletedConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "${app.kafka.topics.kyb-review-completed}",
            containerFactory = "kafkaListenerContainerFactory",
            groupId = "${spring.kafka.consumer.group-id}-kyb"
    )
    public void onMessage(KybReviewCompletedEvent event, Acknowledgment ack) {
        log.info("[Kafka] Processing KybReviewCompleted companyId={} decision={}",
                event.getCompanyId(), event.getDecision());
        try {
            String message = switch (event.getDecision()) {
                case "APPROVED" -> "🎉 Công ty đã được xác minh thành công!";
                case "REJECTED" -> "❌ Yêu cầu xác minh bị từ chối"
                        + (event.getReviewerNote() != null ? ": " + event.getReviewerNote() : "");
                default -> "ℹ️ Cần bổ sung thông tin xác minh công ty"
                        + (event.getReviewerNote() != null ? ": " + event.getReviewerNote() : "");
            };

            CreateNotificationRequest request = CreateNotificationRequest.builder()
                    .recipientId(event.getReviewerAccountId())
                    .recipientType(RecipientType.USER)
                    .type(NotificationType.SYSTEM)
                    .content(message)
                    .entityType("COMPANY")
                    .entityId(event.getCompanyId())
                    .actionUrl("/employer/verification")
                    .build();

            notificationService.createNotification(request);

            log.info("[Kafka] KybReviewCompleted processed companyId={}", event.getCompanyId());
            ack.acknowledge();
        } catch (RuntimeException ex) {
            log.error("[Kafka] Failed to process KybReviewCompleted companyId={}: {}",
                    event.getCompanyId(), ex.getMessage());
            throw ex;
        }
    }
}
