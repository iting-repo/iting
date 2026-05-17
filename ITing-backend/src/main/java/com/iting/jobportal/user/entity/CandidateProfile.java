package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Lưu thông tin riêng của Ứng viên (Candidate).
 * Các trường chung (fullName, phone, avatarUrl) đã được dồn về Account.
 *
 * Đặt tên CandidateProfile thay cho User cũ để tránh nhầm với mọi "user hệ thống".
 * Table: candidate_info (đổi tên từ Users qua V54 migration)
 */
@Entity
@Table(name = "candidate_info")
@Getter
@Setter
public class CandidateProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "Id")
    private Account account;

    /** Khu vực địa lý (FK tới bảng location nếu có) */
    @Column(name = "Loc_id")
    private Long locId;

    /** Vector embedding của CV — dùng cho AI recommendation */
    @Column(name = "Cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
