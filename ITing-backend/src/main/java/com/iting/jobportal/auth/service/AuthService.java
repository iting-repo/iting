package com.iting.jobportal.auth.service;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    void changePassword(Long accountId, ChangePasswordRequest request);

    Account getAccountByEmail(String email);

    Account register(RegisterRequest request);
}
