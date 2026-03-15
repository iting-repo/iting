package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Skill")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Name", length = 100)
    private String name;

    @Column(name = "Level", length = 50)
    private String level;
}