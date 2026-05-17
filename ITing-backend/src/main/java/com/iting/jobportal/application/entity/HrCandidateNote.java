package com.iting.jobportal.application.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Ghi chú cá nhân của từng HR cho mỗi đơn ứng tuyển.
 * Chỉ HR đó mới xem/sửa được — không chia sẻ với HR khác cùng công ty.
 */
@Entity
@Table(name = "hr_candidate_note",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_hr_candidate_note",
                columnNames = {"hr_account_id", "application_id"}
        ))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class HrCandidateNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID tài khoản HR — mỗi HR chỉ thấy ghi chú của chính mình. */
    @Column(name = "hr_account_id", nullable = false)
    private Long hrAccountId;

    /** ID đơn ứng tuyển (apply_form_id). */
    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "note_content", columnDefinition = "TEXT")
    private String noteContent;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
