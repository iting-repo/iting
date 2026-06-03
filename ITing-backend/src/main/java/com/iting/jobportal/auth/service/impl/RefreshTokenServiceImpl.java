package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.dto.request.RefreshTokenRequest;
import com.iting.jobportal.auth.dto.response.TokenResponse;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.RefreshToken;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.RefreshTokenRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.security.RefreshTokenUtil;
import com.iting.jobportal.auth.service.RefreshTokenService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

  private final RefreshTokenRepository refreshTokenRepository;
  private final RefreshTokenUtil refreshTokenUtil;
  private final JwtTokenUtil jwtTokenUtil;
  private final AccountRepository accountRepository;
  private final Optional<RefreshTokenCacheService> tokenCache;

  @Value("${jwt.refresh.max-tokens-per-user:5}")
  private int maxTokensPerUser;

  @Override
  @Transactional
  public RefreshToken createRefreshToken(
      Long userId, String email, String deviceInfo, String ipAddress) {
    // Check token limit
    if (isUserTokenLimitExceeded(userId)) {
      // Revoke oldest token
      List<RefreshToken> userTokens = refreshTokenRepository.findByUserId(userId);
      if (!userTokens.isEmpty()) {
        RefreshToken oldestToken = userTokens.get(0);
        oldestToken.revoke();
        refreshTokenRepository.save(oldestToken);
        log.info("Revoked oldest refresh token for user: {}", userId);
      }
    }

    // Generate new refresh token
    String refreshTokenString = refreshTokenUtil.generateRefreshToken(userId, email);
    String tokenId = refreshTokenUtil.getTokenId(refreshTokenString);

    RefreshToken refreshToken =
        RefreshToken.builder()
            .tokenId(tokenId)
            .userId(userId)
            .email(email)
            .token(refreshTokenString)
            .expiryDate(LocalDateTime.now().plusSeconds(getRefreshExpirationInSeconds()))
            .isUsed(false)
            .isRevoked(false)
            .deviceInfo(deviceInfo)
            .ipAddress(ipAddress)
            .build();

    RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
    tokenCache.ifPresent(c -> c.put(savedToken));
    log.info("Created refresh token for user: {}, tokenId: {}", userId, tokenId);

    return savedToken;
  }

  @Override
  @Transactional
  public TokenResponse refreshToken(RefreshTokenRequest request) {
    String refreshToken = request.getRefreshToken();

    // Validate refresh token
    if (!validateRefreshToken(refreshToken)) {
      throw new RuntimeException("Invalid refresh token");
    }

    // Get token from database
    String tokenId = refreshTokenUtil.getTokenId(refreshToken);
    RefreshToken storedToken = getRefreshTokenByTokenId(tokenId);

    if (storedToken == null || !storedToken.isValid()) {
      throw new RuntimeException("Refresh token is not valid");
    }

    // Get user information
    Long userId = storedToken.getUserId();
    String email = storedToken.getEmail();

    Account account =
        accountRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (account.getStatus() == com.iting.jobportal.auth.entity.Enum.AccountStatus.BANNED) {
      throw new RuntimeException("Tài khoản của bạn đã bị khóa.");
    }

    String primaryRole = "USER";

    // Generate new access token
    String newAccessToken = jwtTokenUtil.generateToken(userId, email, primaryRole);

    // Mark current refresh token as used
    storedToken.markAsUsed();
    refreshTokenRepository.save(storedToken);
    tokenCache.ifPresent(c -> c.evict(storedToken.getTokenId()));

    // Create new refresh token
    RefreshToken newRefreshToken =
        createRefreshToken(userId, email, request.getDeviceInfo(), request.getIpAddress());

    return TokenResponse.builder()
        .accessToken(newAccessToken)
        .refreshToken(newRefreshToken.getToken())
        .tokenType("Bearer")
        .expiresIn(getAccessExpirationInSeconds())
        .build();
  }

  @Override
  @Transactional
  public void revokeRefreshToken(String tokenId) {
    RefreshToken refreshToken = getRefreshTokenByTokenId(tokenId);
    if (refreshToken != null) {
      refreshToken.revoke();
      refreshTokenRepository.save(refreshToken);
      tokenCache.ifPresent(c -> c.evict(tokenId));
      log.info("Revoked refresh token: {}", tokenId);
    }
  }

  @Override
  @Transactional
  public void revokeAllUserTokens(Long userId) {
    refreshTokenRepository.revokeAllUserTokens(userId);
    tokenCache.ifPresent(c -> c.evictAllForUser(userId));
    log.info("Revoked all refresh tokens for user: {}", userId);
  }

  @Override
  @Transactional
  public void cleanupExpiredTokens() {
    LocalDateTime now = LocalDateTime.now();
    refreshTokenRepository.deleteExpiredTokens(now);
    log.info("Cleaned up expired refresh tokens");
  }

  @Override
  public boolean validateRefreshToken(String token) {
    try {
      return refreshTokenUtil.validateRefreshToken(token)
          && !refreshTokenUtil.isTokenExpired(token);
    } catch (Exception e) {
      log.error("Error validating refresh token: {}", e.getMessage());
      return false;
    }
  }

  @Override
  public RefreshToken getRefreshTokenByTokenId(String tokenId) {
    RefreshToken cached = tokenCache.map(c -> c.get(tokenId)).orElse(null);
    if (cached != null) return cached;
    RefreshToken fromDb = refreshTokenRepository.findByTokenId(tokenId).orElse(null);
    if (fromDb != null) tokenCache.ifPresent(c -> c.put(fromDb));
    return fromDb;
  }

  @Override
  public boolean isUserTokenLimitExceeded(Long userId) {
    long activeTokens = refreshTokenRepository.countActiveTokensByUser(userId, LocalDateTime.now());
    return activeTokens >= maxTokensPerUser;
  }

  private long getRefreshExpirationInSeconds() {
    // Default to 7 days (604800 seconds)
    return 604800L;
  }

  private long getAccessExpirationInSeconds() {
    // Default to 24 hours (86400 seconds)
    return 86400L;
  }
}
