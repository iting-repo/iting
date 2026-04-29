package com.iting.jobportal.auth.service;

public interface PasswordResetService {
    void createPasswordResetToken(String email);

    void resetPassword(String email, String otpCode, String newPassword);
}
