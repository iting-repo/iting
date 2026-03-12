package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.service.AdminUserService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final AccountRepository accountRepository;

    @Override
    public Page<UserListResponse> getAllUsers(String keyword, Role role, AccountStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return accountRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public UserListResponse getUserById(Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(account);
    }

    @Override
    public UserListResponse updateUser(Long adminId, Long userId, UpdateUserRequest request) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void banUser(Long adminId, Long userId, BanUserRequest request) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void unbanUser(Long adminId, Long userId) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteUser(Long adminId, Long userId) {
        accountRepository.deleteById(userId);
    }

    private UserListResponse mapToResponse(Account account) {
        return UserListResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .build();
    }
}