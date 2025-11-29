package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.user.entity.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="users")
@Getter @Setter
public class User {

    @Id
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private Account account;

    @Column(length=100)
    private String firstName;

    @Column(length=100)
    private String lastName;

    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private Gender sex;

    @Column(length=1000)
    private String avatarUrl;

    @Column(length=2000)
    private String description;

    @Column(length=500)
    private String address;

    private LocalDateTime lastUpdate;
}
