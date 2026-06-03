package com.iting.jobportal.common.event.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Polls outbox table and ships PENDING rows to Kafka. Uses {@code FOR UPDATE SKIP LOCKED} so
 * multiple replicas can run safely. Enable only on the {@code worker} profile in production to
 * avoid every API instance polling the DB.
 */
@Component
@RequiredArgsConstructor
@EnableScheduling
@ConditionalOnProperty(prefix = "app.outbox", name = "enabled", havingValue = "true")
@Slf4j
public class OutboxDispatcher {

  private final OutboxEventRepository repository;
  private final KafkaTemplate<String, Object> kafkaTemplate;
  private final ObjectMapper objectMapper;

  @Value("${app.outbox.batch-size:100}")
  private int batchSize;

  @Scheduled(fixedDelayString = "${app.outbox.poll-delay-ms:2000}")
  @Transactional
  public void dispatch() {
    List<OutboxEvent> batch = repository.lockPendingBatch(batchSize);
    if (batch.isEmpty()) return;

    for (OutboxEvent row : batch) {
      try {
        Class<?> type = Class.forName(row.getTypeInfo());
        Object payload = objectMapper.readValue(row.getPayload(), type);
        kafkaTemplate.send(row.getTopic(), row.getAggregateKey(), payload).get();
        row.setStatus(OutboxEvent.Status.SENT);
        row.setSentAt(LocalDateTime.now());
        row.setLastError(null);
      } catch (Exception ex) {
        row.setAttempts(row.getAttempts() + 1);
        row.setLastError(truncate(ex.getMessage()));
        if (row.getAttempts() >= 10) {
          row.setStatus(OutboxEvent.Status.FAILED);
          log.error(
              "Outbox row {} marked FAILED after {} attempts: {}",
              row.getId(),
              row.getAttempts(),
              ex.getMessage());
        } else {
          log.warn(
              "Outbox row {} attempt {} failed: {}",
              row.getId(),
              row.getAttempts(),
              ex.getMessage());
        }
      }
    }
    repository.saveAll(batch);
  }

  private static String truncate(String s) {
    if (s == null) return null;
    return s.length() > 2000 ? s.substring(0, 2000) : s;
  }
}
