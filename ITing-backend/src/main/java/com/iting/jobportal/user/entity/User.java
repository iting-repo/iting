package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Candidate-specific extension of {@link Account} (1-1 via @MapsId).
 *
 * <p>Login + contact identity (email, password, full_name, phone, avatar_url) lives on Account.
 * This entity only holds fields meaningful for CANDIDATE role: home location, AI CV embedding,
 * and profile-snapshot timestamp.
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

    @Column(name = "Cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
