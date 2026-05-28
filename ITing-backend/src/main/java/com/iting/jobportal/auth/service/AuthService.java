package com.iting.jobportal.auth.service;

import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.entity.Account;

public interface AuthService {

  LoginResponse login(LoginRequest request);

  LoginResponse loginWithGoogle(String tokenId);

  void changePassword(Long accountId, ChangePasswordRequest request);

  Account getAccountByEmail(String email);

  Account register(RegisterRequest request);

  void verifyOtp(String email, String code);

  void resendOtp(String email);

  com.iting.jobportal.auth.dto.response.UserMeResponse getMeResponse(Long accountId);
}
