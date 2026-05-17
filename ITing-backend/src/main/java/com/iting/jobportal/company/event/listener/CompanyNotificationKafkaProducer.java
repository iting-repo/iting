package com.iting.jobportal.company.event.listener;

import com.iting.jobportal.company.event.CompanyInfoSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true")
public class CompanyNotificationKafkaProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @EventListener
    public void produceKybNotificationToKafka(CompanyInfoSubmittedEvent event) {
        log.info("Sending CompanyInfoSubmittedEvent to Kafka Topic 'kyb-notifications' for Company: {}",
                event.getCompanyName());

        // Gửi message nhẹ dạng chuỗi CSV hoặc JSON
        // Ở đây gửi chuỗi: "companyId,companyName" để Worker xử lý
        String messagePayload = event.getCompanyId() + "|||" + event.getCompanyName();

        kafkaTemplate.send("kyb-notifications", event.getCompanyId().toString(), messagePayload);
    }
}
