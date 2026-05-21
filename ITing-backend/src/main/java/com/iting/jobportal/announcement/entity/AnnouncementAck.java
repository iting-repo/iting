package com.iting.jobportal.announcement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/** User đã dismiss/accept announcement nào → không show lại nữa. */
@Entity
@Table(name = "announcement_acks")
@IdClass(AnnouncementAck.AnnouncementAckId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementAck {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "announcement_id")
    private Long announcementId;

    @Column(name = "acked_at", nullable = false)
    private LocalDateTime ackedAt;

    @PrePersist
    void onCreate() {
        if (ackedAt == null) ackedAt = LocalDateTime.now();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class AnnouncementAckId implements Serializable {
        private Long userId;
        private Long announcementId;
    }
}
