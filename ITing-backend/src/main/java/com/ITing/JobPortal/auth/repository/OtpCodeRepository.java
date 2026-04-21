package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(String email, boolean isVerification);
    void deleteByEmail(String email);
}
