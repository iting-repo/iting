package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.userprofile.entity.enums.EmploymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
public class UserProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    // Thông tin cơ bản
    @Column(name = "headline", length = 255)
    private String headline; // VD: Backend Java Developer | Spring Boot

    @Column(name = "location", length = 255)
    private String location; // khu vực

    @Column(name = "total_experience_years")
    private Integer totalExperienceYears; // tổng số năm kinh nghiệm

    @Column(name = "education_summary", length = 255)
    private String educationSummary; // VD: ĐH Bách Khoa Hà Nội

    @Column(name = "short_bio", columnDefinition = "TEXT")
    private String shortBio; // giới thiệu ngắn

    // Trạng thái tìm việc / lương mong muốn
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", length = 50)
    private EmploymentStatus employmentStatus;

    @Column(name = "is_open_to_work")
    private Boolean openToWork = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContactInfo contactInfo;

    // Quan hệ
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Experience> workExperiences = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificate> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialLink> externalLinks = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CV> cvs = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Portfolio> portfolios = new ArrayList<>();
}

