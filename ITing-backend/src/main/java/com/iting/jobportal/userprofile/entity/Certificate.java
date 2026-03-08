package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Certificate")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "User_id", length = 255)
    private String userId;

    private String name;          // Tên chứng chỉ
    private String organization;  // Tổ chức cấp
    private LocalDate date;       // Ngày cấp
}
