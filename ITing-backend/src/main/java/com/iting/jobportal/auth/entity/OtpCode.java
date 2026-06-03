package com.iting.jobportal.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OtpCode")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpCode {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "Email", nullable = false)
  private String email;

  @Column(name = "Code", nullable = false, length = 6)
  private String code;

  @Column(name = "ExpiryTime", nullable = false)
  private LocalDateTime expiryTime;

  @Column(name = "IsVerification", nullable = false)
  private boolean isVerification = true;
}
