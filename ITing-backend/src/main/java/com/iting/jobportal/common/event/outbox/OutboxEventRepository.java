package com.iting.jobportal.common.event.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    /**
     * Pull a batch of pending rows with row-level lock + skip-locked so
     * multiple dispatcher instances don't fight over the same rows.
     * Note: FOR UPDATE SKIP LOCKED is embedded in the native SQL;
     * do NOT add @Lock — Hibernate 6.4 forbids it on native queries.
     */
    @Query(value = "SELECT * FROM postgres.outbox_event WHERE status = 'PENDING' " +
                   "ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT :limit",
           nativeQuery = true)
    List<OutboxEvent> lockPendingBatch(@Param("limit") int limit);
}
