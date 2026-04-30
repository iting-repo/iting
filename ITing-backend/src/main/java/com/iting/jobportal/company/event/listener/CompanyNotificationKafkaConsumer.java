package com.iting.jobportal.company.event.listener;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true")
public class CompanyNotificationKafkaConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "kyb-notifications", groupId = "kyb-notification-group")
    public void consumeKybNotification(String messagePayload) {
        try {
            log.info("Worker received Kafka message: {}", messagePayload);

            // Tách dữ liệu "id|||Name"
            String[] parts = messagePayload.split("\\|\\|\\|");
            Long companyId = Long.parseLong(parts[0]);
            String companyName = parts[1];

            CreateNotificationRequest request = CreateNotificationRequest.builder()
                    .recipientId(1L) // Gửi cho Admin chính
                    .recipientType(RecipientType.ADMIN)
                    .type(NotificationType.COMPANY_UPDATE)
                    .content("Công ty [" + companyName + "] vừa cập nhật hồ sơ đăng ký và đang chờ duyệt!")
                    .entityType("COMPANY")
                    .entityId(companyId)
                    .actionUrl("/admin/companies/" + companyId)
                    .build();

            notificationService.createNotification(request);
            log.info("Worker successfully generated Admin notification for company {}", companyId);
        } catch (Exception e) {
            log.error("Worker failed to process Kafka message: {}", messagePayload, e);
        }
    }
}
