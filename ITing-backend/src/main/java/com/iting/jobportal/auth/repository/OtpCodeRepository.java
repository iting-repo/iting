package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.OtpCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
  Optional<OtpCode> findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(
      String email, boolean isVerification);

  void deleteByEmail(String email);
}
