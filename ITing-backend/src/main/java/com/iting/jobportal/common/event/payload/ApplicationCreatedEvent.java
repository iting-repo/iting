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
public class ApplicationCreatedEvent implements DomainEvent {
  private String eventId;
  private Instant occurredAt;
  private Long applicationId;
  private Long jobId;
  private Long candidateAccountId;
  private Long employerAccountId;

  public static ApplicationCreatedEvent of(
      Long applicationId, Long jobId, Long candidateId, Long employerId) {
    return ApplicationCreatedEvent.builder()
        .eventId(UUID.randomUUID().toString())
        .occurredAt(Instant.now())
        .applicationId(applicationId)
        .jobId(jobId)
        .candidateAccountId(candidateId)
        .employerAccountId(employerId)
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
    return "application:" + applicationId;
  }
}
