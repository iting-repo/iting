package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenId(String tokenId);

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserIdAndIsUsedFalseAndIsRevokedFalseAndExpiryDateAfter(Long userId, LocalDateTime now);

    List<RefreshToken> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.userId = :userId")
    void revokeAllUserTokens(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.isUsed = true AND rt.expiryDate < :date")
    void deleteUsedAndExpiredTokens(@Param("date") LocalDateTime date);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :date")
    void deleteExpiredTokens(@Param("date") LocalDateTime date);

    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.userId = :userId AND rt.isUsed = false AND rt.isRevoked = false AND rt.expiryDate > :now")
    long countActiveTokensByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    boolean existsByTokenId(String tokenId);
}
