package com.iting.jobportal.common.event.consumer;

import com.iting.jobportal.common.event.payload.ApplicationCreatedEvent;
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
 * Consumes ApplicationCreatedEvent from Kafka.
 * Triggers push notification to HR (employer) about new application.
 * On unrecoverable error: DefaultErrorHandler routes to {topic}.DLT.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "spring.kafka", name = "enabled", havingValue = "true")
@Slf4j
public class ApplicationCreatedConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "${app.kafka.topics.application-created}",
            containerFactory = "kafkaListenerContainerFactory",
            groupId = "${spring.kafka.consumer.group-id}-application"
    )
    public void onMessage(ApplicationCreatedEvent event, Acknowledgment ack) {
        log.info("[Kafka] Processing ApplicationCreated applicationId={} jobId={} candidate={}",
                event.getApplicationId(), event.getJobId(), event.getCandidateAccountId());
        try {
            CreateNotificationRequest request = CreateNotificationRequest.builder()
                    .recipientId(event.getEmployerAccountId())
                    .recipientType(RecipientType.USER)
                    .type(NotificationType.APPLICATION_STATUS_CHANGED)
                    .content("Ứng viên mới ứng tuyển vào công việc #" + event.getJobId())
                    .entityType("APPLICATION")
                    .entityId(event.getApplicationId())
                    .actionUrl("/employer/applications")
                    .build();

            notificationService.createNotification(request);

            log.info("[Kafka] ApplicationCreated processed successfully applicationId={}",
                    event.getApplicationId());
            ack.acknowledge();
        } catch (RuntimeException ex) {
            log.error("[Kafka] Failed to process ApplicationCreated applicationId={}: {}",
                    event.getApplicationId(), ex.getMessage());
            throw ex;
        }
    }
}
