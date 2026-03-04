package com.iting.jobportal.userprofile.entity;

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

    @Column(name = "User_id", length = 255)
    private String userId;

    @Column(name = "File_path", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "Upload_time")
    private LocalDateTime uploadedAt;
}
