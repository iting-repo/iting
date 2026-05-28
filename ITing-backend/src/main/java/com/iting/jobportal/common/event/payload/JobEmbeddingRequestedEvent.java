package com.iting.jobportal.common.event.payload;

import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobEmbeddingRequestedEvent implements DomainEvent {
  private String eventId;
  private Instant occurredAt;
  private Long jobId;
  private String title;
  private String descriptionDigest;

  public static JobEmbeddingRequestedEvent of(Long jobId, String title, String descriptionDigest) {
    return JobEmbeddingRequestedEvent.builder()
        .eventId(UUID.randomUUID().toString())
        .occurredAt(Instant.now())
        .jobId(jobId)
        .title(title)
        .descriptionDigest(descriptionDigest)
        .build();
  }

  @Override
  public String eventId() {
    return eventId;
  }

  @Override
  public Instant occurredAt() {
    return occurredAt;
  }

  @Override
  public String aggregateKey() {
    return "job:" + jobId;
  }
}
