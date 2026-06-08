package com.iting.jobportal.auth.service;

import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.request.TwoFactorRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.entity.Account;

public interface AuthService {

  LoginResponse login(LoginRequest request);

  /** Bước 2: thiết lập 2FA lần đầu — xác minh mã từ authenticator rồi kích hoạt + cấp token. */
  LoginResponse twoFactorSetupVerify(TwoFactorRequest request);

  /** Bước 2: đăng nhập với 2FA đã bật — xác minh mã TOTP rồi cấp token. */
  LoginResponse twoFactorVerify(TwoFactorRequest request);

  LoginResponse loginWithGoogle(String tokenId);

  LoginResponse loginWithFacebook(String accessToken);

  void changePassword(Long accountId, ChangePasswordRequest request);

  Account getAccountByEmail(String email);

  Account register(RegisterRequest request);

  void verifyOtp(String email, String code);

  void resendOtp(String email);

  com.iting.jobportal.auth.dto.response.UserMeResponse getMeResponse(Long accountId);
}
