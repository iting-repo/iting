package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Portfolio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    private String title;
    private String url;
    private String description;
}


