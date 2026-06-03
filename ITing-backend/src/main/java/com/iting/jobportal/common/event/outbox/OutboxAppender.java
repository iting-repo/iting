package com.iting.jobportal.common.event.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.event.payload.DomainEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes a domain event to the outbox table inside the caller's DB transaction. If the surrounding
 * transaction rolls back, the event is rolled back too — guaranteeing "no event without state
 * change, no state change without event".
 *
 * <p>Only active when Kafka is enabled. Callers should inject {@code Optional<OutboxAppender>}.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "spring.kafka", name = "enabled", havingValue = "true")
public class OutboxAppender {

  private final OutboxEventRepository repository;
  private final ObjectMapper objectMapper;

  @Transactional(propagation = Propagation.MANDATORY)
  public void append(String topic, String aggregate, DomainEvent event) {
    String json;
    try {
      json = objectMapper.writeValueAsString(event);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Cannot serialize event " + event.eventId(), e);
    }
    OutboxEvent row =
        OutboxEvent.builder()
            .eventId(event.eventId())
            .aggregate(aggregate)
            .aggregateKey(event.aggregateKey())
            .topic(topic)
            .payload(json)
            .typeInfo(event.getClass().getName())
            .status(OutboxEvent.Status.PENDING)
            .attempts(0)
            .build();
    repository.save(row);
  }
}
