package com.iting.jobportal.auth.entity;

import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "accounts")
@Getter @Setter
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role; // CANDIDATE, EMPLOYER, ADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountStatus status; // ACTIVE, INACTIVE, BANNED

    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // getters & setters
}
