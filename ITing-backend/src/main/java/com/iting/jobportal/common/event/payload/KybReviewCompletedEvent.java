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
public class KybReviewCompletedEvent implements DomainEvent {
  private String eventId;
  private Instant occurredAt;
  private Long companyId;
  private String decision; // APPROVED | REJECTED | NEEDS_INFO
  private String reviewerNote;
  private Long reviewerAccountId;

  public static KybReviewCompletedEvent of(
      Long companyId, String decision, String note, Long reviewerId) {
    return KybReviewCompletedEvent.builder()
        .eventId(UUID.randomUUID().toString())
        .occurredAt(Instant.now())
        .companyId(companyId)
        .decision(decision)
        .reviewerNote(note)
        .reviewerAccountId(reviewerId)
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
    return "company:" + companyId;
  }
}
