package com.iting.jobportal.application.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Apply_form")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "User_id", nullable = false)
    private Long userId;

    @Column(name = "Cv_title", length = 255)
    private String cvTitle;

    @Column(name = "Applicant_name", length = 255)
    private String applicantName;

    @Column(name = "Introduction", columnDefinition = "TEXT")
    private String introduction;
}
