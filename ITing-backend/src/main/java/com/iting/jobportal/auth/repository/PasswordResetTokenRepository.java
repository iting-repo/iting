package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
  Optional<PasswordResetToken> findByToken(String token);

  void deleteAllByExpiresAtBefore(LocalDateTime time);
}
