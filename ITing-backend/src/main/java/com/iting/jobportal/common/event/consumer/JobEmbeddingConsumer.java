package com.iting.jobportal.common.event.consumer;

import com.iting.jobportal.common.event.payload.JobEmbeddingRequestedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

/**
 * Consumes embedding requests and delegates to the ML microservice. On unrecoverable error: bubble
 * up — DefaultErrorHandler routes to {topic}.DLT.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "spring.kafka", name = "enabled", havingValue = "true")
@Slf4j
public class JobEmbeddingConsumer {

  // Inject your existing JobEmbeddingService here when wiring this up:
  // private final JobEmbeddingService jobEmbeddingService;

  @KafkaListener(
      topics = "${app.kafka.topics.job-embedding-requested}",
      containerFactory = "kafkaListenerContainerFactory",
      groupId = "${spring.kafka.consumer.group-id}-embedding")
  public void onMessage(JobEmbeddingRequestedEvent event, Acknowledgment ack) {
    log.info(
        "Processing JobEmbeddingRequested jobId={} eventId={}",
        event.getJobId(),
        event.getEventId());
    try {
      // jobEmbeddingService.computeAndPersist(event.getJobId());
      ack.acknowledge();
    } catch (RuntimeException ex) {
      log.error("Embedding failed for jobId={}: {}", event.getJobId(), ex.getMessage());
      throw ex;
    }
  }
}
