package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.BanUserRequest;
import com.iting.jobportal.admin.dto.request.UpdateUserRequest;
import com.iting.jobportal.admin.dto.response.UserListResponse;
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

    void bulkBanUsers(java.util.List<Long> userIds, BanUserRequest request);

    void bulkUnbanUsers(java.util.List<Long> userIds);

    void bulkDeleteUsers(java.util.List<Long> userIds);

    java.io.ByteArrayInputStream exportUsersToExcel();

    void importUsersFromExcel(org.springframework.web.multipart.MultipartFile file);

    java.io.ByteArrayInputStream getImportTemplate();
}