package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.user.entity.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(name = "Phone_num", length = 20)
    private String phoneNum;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;

    @Column(name = "F_name", length = 100)
    private String firstName;

    @Column(name = "L_name", length = 100)
    private String lastName;

    @Column(name = "B_date")
    private LocalDate birthDate;

    @Column(name = "B_month")
    private Integer birthMonth;

    @Column(name = "B_year")
    private Integer birthYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "Sex", length = 10)
    private Gender sex;

    @Column(name = "Avatar", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Address", length = 500)
    private String address;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
