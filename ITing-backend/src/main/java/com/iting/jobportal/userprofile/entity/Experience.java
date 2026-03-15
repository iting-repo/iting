package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Experience")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Company_name", length = 255)
    private String companyName;

    @Column(name = "Position", length = 255)
    private String position;

    @Column(name = "Start_date")
    private LocalDate startDate;

    @Column(name = "End_date")
    private LocalDate endDate;

    @Column(name = "Is_current")
    private Boolean isCurrent;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;
}