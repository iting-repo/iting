package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.request.BanUserRequest;
import com.iting.jobportal.admin.dto.request.UpdateUserRequest;
import com.iting.jobportal.admin.dto.response.UserListResponse;
import com.iting.jobportal.admin.service.AdminUserService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final CompanyHrAffiliationRepository affiliationRepository;

    @Override
    public Page<UserListResponse> getAllUsers(String keyword, Role role, AccountStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Specification<Account> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";

                // Sau Phase 2: Account không còn @OneToOne với Company → bỏ join company.
                // Search company name dùng kênh khác (admin endpoint /api/admin/companies).
                var userJoin = root.join("user", jakarta.persistence.criteria.JoinType.LEFT);

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(userJoin.get("fullName")), pattern)));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return accountRepository.findAll(spec, pageable)
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
    @Transactional
    public void deleteUser(Long adminId, Long userId) {
        accountRepository.deleteById(userId);
    }

    @Override
    @Transactional
    public void bulkBanUsers(java.util.List<Long> userIds, BanUserRequest request) {
        java.util.List<Account> accounts = accountRepository.findAllById(userIds);
        accounts.forEach(account -> account.setStatus(AccountStatus.BANNED));
        accountRepository.saveAll(accounts);
    }

    @Override
    @Transactional
    public void bulkUnbanUsers(java.util.List<Long> userIds) {
        java.util.List<Account> accounts = accountRepository.findAllById(userIds);
        accounts.forEach(account -> account.setStatus(AccountStatus.ACTIVE));
        accountRepository.saveAll(accounts);
    }

    @Override
    @Transactional
    public void bulkDeleteUsers(java.util.List<Long> userIds) {
        userIds.forEach(accountRepository::deleteById);
    }

    @Override
    public java.io.ByteArrayInputStream exportUsersToExcel() {
        List<Account> accounts = accountRepository.findAll();
        String[] headers = { "ID", "Email", "Role", "Status", "Full Name", "Company Name", "Created At" };

        return com.iting.jobportal.common.excel.ExcelHelper.dataToExcel(
                accounts,
                headers,
                "Users",
                (account, row) -> {
                    row.createCell(0).setCellValue(account.getId());
                    row.createCell(1).setCellValue(account.getEmail());
                    row.createCell(2).setCellValue(account.getRole().toString());
                    row.createCell(3).setCellValue(account.getStatus().toString());

                    String fullName = "";
                    if (account.getUser() != null) {
                        fullName = account.getUser().getFullName();
                    }
                    row.createCell(4).setCellValue(fullName);

                    // Resolve companyName qua affiliation (lấy company của affiliation
                    // active gần nhất; chỉ EMPLOYER/HR mới có).
                    String companyName = affiliationRepository
                            .findActiveByHrAccountId(account.getId())
                            .map(a -> a.getCompany() != null ? a.getCompany().getName() : "")
                            .orElse("");
                    row.createCell(5).setCellValue(companyName);

                    row.createCell(6)
                            .setCellValue(account.getCreatedAt() != null ? account.getCreatedAt().toString() : "");
                });
    }

    @Override
    public void importUsersFromExcel(org.springframework.web.multipart.MultipartFile file) {
        try {
            java.util.List<Account> accounts = com.iting.jobportal.common.excel.ExcelHelper.excelToData(
                    file.getInputStream(),
                    row -> {
                        Account account = new Account();
                        account.setEmail(row.getCell(0).getStringCellValue());
                        account.setPasswordHash("123456"); // Default password for imported users
                        account.setRole(Role.valueOf(row.getCell(1).getStringCellValue()));
                        account.setStatus(AccountStatus.ACTIVE);
                        return account;
                    });
            accountRepository.saveAll(accounts);
        } catch (java.io.IOException e) {
            throw new RuntimeException("fail to store excel data: " + e.getMessage());
        }
    }

    @Override
    public java.io.ByteArrayInputStream getImportTemplate() {
        String[] headers = { "Email", "Role (CANDIDATE/EMPLOYER/ADMIN)" };
        return com.iting.jobportal.common.excel.ExcelHelper.createTemplate(headers, "User Import Template");
    }

    private UserListResponse mapToResponse(Account account) {
        UserListResponse response = UserListResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .role(account.getRole())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .lastLoginAt(account.getLastLoginAt())
                .build();

        if (account.getUser() != null) {
            response.setFullName(account.getUser().getFullName());
            response.setAvatarUrl(account.getUser().getAvatarUrl());
        }

        // Resolve company qua affiliation (active = INCOMPLETE/PENDING/APPROVED).
        affiliationRepository.findActiveByHrAccountId(account.getId())
                .ifPresent(aff -> {
                    if (aff.getCompany() != null) {
                        response.setCompanyName(aff.getCompany().getName());
                        if (response.getAvatarUrl() == null) {
                            response.setAvatarUrl(aff.getCompany().getLogoUrl());
                        }
                    }
                });

        return response;
    }
}