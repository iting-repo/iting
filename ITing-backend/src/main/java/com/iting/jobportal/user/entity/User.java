package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Candidate/Employer-specific extension of {@link Account} (1-1 via @MapsId).
 *
 * <p>Identity fields (full_name, phone, avatar_url) live on Account (source of truth since V54).
 * This entity only holds CANDIDATE-specific fields: home location, AI CV embedding.
 *
 * <p>Table was renamed from "users" → "candidate_info" by V54.
 */
@Entity
@Table(name = "candidate_info")
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

    @Column(name = "Cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
