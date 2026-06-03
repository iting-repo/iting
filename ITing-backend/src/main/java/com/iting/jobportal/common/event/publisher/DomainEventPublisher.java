package com.iting.jobportal.common.event.publisher;

import com.iting.jobportal.common.event.KafkaTopics;
import com.iting.jobportal.common.event.payload.ApplicationCreatedEvent;
import com.iting.jobportal.common.event.payload.DomainEvent;
import com.iting.jobportal.common.event.payload.JobEmbeddingRequestedEvent;
import com.iting.jobportal.common.event.payload.KybReviewCompletedEvent;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

/**
 * Direct Kafka publisher. Use this for fire-and-forget signals. For events that MUST not be lost on
 * rollback, route through the Outbox instead.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "spring.kafka", name = "enabled", havingValue = "true")
@Slf4j
public class DomainEventPublisher {

  private final KafkaTemplate<String, Object> kafkaTemplate;
  private final KafkaTopics topics;

  public CompletableFuture<SendResult<String, Object>> publish(JobEmbeddingRequestedEvent e) {
    return send(topics.getJobEmbeddingRequested(), e.aggregateKey(), e);
  }

  public CompletableFuture<SendResult<String, Object>> publish(ApplicationCreatedEvent e) {
    return send(topics.getApplicationCreated(), e.aggregateKey(), e);
  }

  public CompletableFuture<SendResult<String, Object>> publish(KybReviewCompletedEvent e) {
    return send(topics.getKybReviewCompleted(), e.aggregateKey(), e);
  }

  public CompletableFuture<SendResult<String, Object>> publishRaw(String topic, DomainEvent e) {
    return send(topic, e.aggregateKey(), e);
  }

  private CompletableFuture<SendResult<String, Object>> send(
      String topic, String key, Object payload) {
    return kafkaTemplate
        .send(topic, key, payload)
        .whenComplete(
            (res, ex) -> {
              if (ex != null) {
                log.error("Kafka publish failed topic={} key={} : {}", topic, key, ex.getMessage());
              } else {
                log.debug(
                    "Published topic={} key={} offset={}",
                    topic,
                    key,
                    res.getRecordMetadata().offset());
              }
            });
  }
}
