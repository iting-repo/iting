package com.iting.jobportal.auth.service;

import com.iting.jobportal.auth.dto.request.RefreshTokenRequest;
import com.iting.jobportal.auth.dto.response.TokenResponse;
import com.iting.jobportal.auth.entity.RefreshToken;

public interface RefreshTokenService {

    /**
     * Tạo refresh token mới cho user
     */
    RefreshToken createRefreshToken(Long userId, String email, String deviceInfo, String ipAddress);

    /**
     * Refresh access token sử dụng refresh token
     */
    TokenResponse refreshToken(RefreshTokenRequest request);

    /**
     * Revoke (hủy) refresh token
     */
    void revokeRefreshToken(String tokenId);

    /**
     * Revoke tất cả refresh tokens của user
     */
    void revokeAllUserTokens(Long userId);

    /**
     * Xóa các refresh token đã sử dụng và hết hạn
     */
    void cleanupExpiredTokens();

    /**
     * Validate refresh token
     */
    boolean validateRefreshToken(String token);

    /**
     * Lấy refresh token theo tokenId
     */
    RefreshToken getRefreshTokenByTokenId(String tokenId);

    /**
     * Kiểm tra số lượng active tokens của user
     */
    boolean isUserTokenLimitExceeded(Long userId);
}
