package com.iting.jobportal.application.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "Apply_form_user_to_job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyFormSentToJob {

    @EmbeddedId
    private ApplyFormSentToJobId id;

    @Column(name = "Time_sent")
    private LocalDateTime timeSent;

    @PrePersist
    protected void onCreate() {
        if (timeSent == null) {
            timeSent = LocalDateTime.now();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class ApplyFormSentToJobId implements Serializable {

        @Column(name = "Job_id", nullable = false)
        private Long jobId;

        @Column(name = "Apply_form_id", nullable = false)
        private Long applyFormId;
    }
}
