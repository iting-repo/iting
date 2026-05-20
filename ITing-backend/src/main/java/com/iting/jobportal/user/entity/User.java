package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Candidate-specific extension of {@link Account} (1-1 via @MapsId).
 *
 * <p>
 * Identity fields (full_name, phone, avatar_url) live on Account (source of
 * truth since V54).
 * AI CV embedding moved to {@link com.iting.jobportal.userprofile.entity.CV}
 * per-document by V84.
 *
 * <p>
 * Table was renamed from "users" → "candidate_info" by V54.
 */
@Entity
@Table(name = "Users")
@Getter
@Setter
public class User {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "Id")
    private Account account;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
