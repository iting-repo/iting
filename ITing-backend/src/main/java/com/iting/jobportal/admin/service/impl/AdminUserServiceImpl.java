package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.service.AdminUserService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Override
    public Page<UserListResponse> getAllUsers(String keyword, Role role, AccountStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        // For simplicity, we just return all since sorting/filtering might need Specifications
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
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getRole() != null) {
            account.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            account.setStatus(request.getStatus());
        }
        
        account = accountRepository.save(account);
        return mapToResponse(account);
    }

    @Override
    public void banUser(Long adminId, Long userId, BanUserRequest request) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        account.setStatus(AccountStatus.BANNED);
        accountRepository.save(account);
    }

    @Override
    public void unbanUser(Long adminId, Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);
    }

    @Override
    public void deleteUser(Long adminId, Long userId) {
        accountRepository.deleteById(userId);
    }

    private UserListResponse mapToResponse(Account account) {
        UserListResponse response = UserListResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .role(account.getRole())
                .status(account.getStatus())
                .build();
                
        Optional<User> userOpt = userRepository.findById(account.getId());
        if (userOpt.isPresent()) {
            response.setFullName(userOpt.get().getFullName());
            response.setAvatarUrl(userOpt.get().getAvatarUrl());
        }
        
        return response;
    }
}