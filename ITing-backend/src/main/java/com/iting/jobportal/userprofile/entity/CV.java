package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.userprofile.entity.enums.CvStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CV")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Title", length = 255)
    private String title;

    @Column(name = "File_name", length = 255)
    private String fileName;

    @Column(name = "File_path", columnDefinition = "TEXT", nullable = false)
    private String fileUrl;

    @Column(name = "S3_key", length = 500)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(name = "Cv_status", length = 50)
    private CvStatus cvStatus;

    @Column(name = "Is_default")
    private Boolean isDefault = false;

    @Column(name = "Upload_time")
    private LocalDateTime uploadedAt;
}

