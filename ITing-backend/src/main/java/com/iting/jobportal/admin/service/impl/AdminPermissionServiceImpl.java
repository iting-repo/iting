package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.entity.UserPermissionOverride;
import com.iting.jobportal.admin.repository.UserPermissionOverrideRepository;
import com.iting.jobportal.admin.service.AdminPermissionService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPermissionServiceImpl implements AdminPermissionService {

    private final UserPermissionOverrideRepository overrideRepository;
    private final AccountRepository accountRepository;

    @Override
    public Map<String, Boolean> getOverrides(Long accountId) {
        Map<String, Boolean> result = new LinkedHashMap<>();
        overrideRepository.findByAccountId(accountId)
            .forEach(o -> result.put(o.getPermissionKey(), o.isGranted()));
        return result;
    }

    @Override
    @Transactional
    public void replaceOverrides(Long adminId, Long accountId, Map<String, Boolean> overrides) {
        overrideRepository.deleteByAccountId(accountId);
        if (overrides == null || overrides.isEmpty()) return;

        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
        Account admin = accountRepository.findById(adminId)
            .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminId));

        List<UserPermissionOverride> entities = overrides.entrySet().stream()
            .map(e -> UserPermissionOverride.builder()
                .account(account)
                .permissionKey(e.getKey())
                .granted(e.getValue())
                .grantedBy(admin)
                .build())
            .collect(Collectors.toList());
        overrideRepository.saveAll(entities);
    }

    @Override
    @Transactional
    public void deleteOverride(Long adminId, Long accountId, String permissionKey) {
        overrideRepository.deleteByAccountIdAndPermissionKey(accountId, permissionKey);
    }

    @Override
    @Transactional
    public void clearOverrides(Long adminId, Long accountId) {
        overrideRepository.deleteByAccountId(accountId);
    }

    @Override
    @Transactional
    public void bulkReplaceOverrides(long adminId, List<Long> accountIds, Map<String, Boolean> overrides) {
        if (accountIds == null || accountIds.isEmpty()) return;

        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminId));

        List<UserPermissionOverride> toSave = new java.util.ArrayList<>();
        for (Long accountId : accountIds) {
            overrideRepository.deleteByAccountId(accountId);
            if (overrides == null || overrides.isEmpty()) continue;

            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
            overrides.forEach((key, value) -> toSave.add(
                    UserPermissionOverride.builder()
                            .account(account)
                            .permissionKey(key)
                            .granted(value)
                            .grantedBy(admin)
                            .build()));
        }
        if (!toSave.isEmpty()) {
            overrideRepository.saveAll(toSave);
        }
    }
}
