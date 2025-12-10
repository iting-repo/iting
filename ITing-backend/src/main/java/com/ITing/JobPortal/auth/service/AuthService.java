package com.iting.jobportal.auth.service;

import com.iting.jobportal.auth.dto.LoginRequest;
import com.iting.jobportal.auth.dto.LoginResponse;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.dto.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.RegisterRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    void changePassword(Long accountId, ChangePasswordRequest request);

    Account getAccountByEmail(String email);

    Account register(RegisterRequest request);
}
