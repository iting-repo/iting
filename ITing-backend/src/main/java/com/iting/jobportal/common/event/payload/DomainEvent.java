package com.iting.jobportal.common.event.payload;

import java.time.Instant;

public interface DomainEvent {
    String eventId();
    Instant occurredAt();
    String aggregateKey();
}
