package com.iting.jobportal.common.event.outbox;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    /**
     * Pull a batch of pending rows with row-level lock + skip-locked so
     * multiple dispatcher instances don't fight over the same rows.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({
        @jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "0"),
        @jakarta.persistence.QueryHint(name = "javax.persistence.lock.timeout", value = "0")
    })
    @Query(value = "SELECT * FROM postgres.outbox_event WHERE status = 'PENDING' " +
                   "ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT :limit",
           nativeQuery = true)
    List<OutboxEvent> lockPendingBatch(@Param("limit") int limit);

    List<OutboxEvent> findTop100ByStatusOrderByCreatedAtAsc(OutboxEvent.Status status, Pageable pageable);
}
