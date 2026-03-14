package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.BanUserRequest;
import com.iting.jobportal.admin.dto.UpdateUserRequest;
import com.iting.jobportal.admin.dto.UserListResponse;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import org.springframework.data.domain.Page;

public interface AdminUserService {

    Page<UserListResponse> getAllUsers(String keyword, Role role, AccountStatus status, int page, int size);

    UserListResponse getUserById(Long userId);

    UserListResponse updateUser(Long adminId, Long userId, UpdateUserRequest request);

    void banUser(Long adminId, Long userId, BanUserRequest request);

    void unbanUser(Long adminId, Long userId);

    void deleteUser(Long adminId, Long userId);

}