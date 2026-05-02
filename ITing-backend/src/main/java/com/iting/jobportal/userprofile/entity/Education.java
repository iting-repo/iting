package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Education")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "School_name", length = 255)
    private String schoolName;

    @Column(name = "Major", length = 255)
    private String major;

    @Column(name = "Area_of_study", length = 255)
    private String areaOfStudy;

    @Column(name = "Degree", length = 100)
    private String degree;

    @Column(name = "Start_date")
    private LocalDate startDate;

    @Column(name = "End_date")
    private LocalDate endDate;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;
}
