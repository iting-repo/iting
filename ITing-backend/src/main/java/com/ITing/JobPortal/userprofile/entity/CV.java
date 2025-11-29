package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;        // ID của user sở hữu CV
    private String fileUrl;     // URL file CV sau khi upload Cloudinary / Firebase / Local
    private LocalDate uploadedAt;  // Ngày tải lên
}
