package com.iting.jobportal.admin.service;

import java.util.List;
import java.util.Map;

public interface AdminPermissionService {
    Map<String, Boolean> getOverrides(Long accountId);
    void replaceOverrides(Long adminId, Long accountId, Map<String, Boolean> overrides);
    void deleteOverride(Long adminId, Long accountId, String permissionKey);
    void clearOverrides(Long adminId, Long accountId);

    /** Apply the same set of permission overrides to multiple users in one call. */
    void bulkReplaceOverrides(long adminId, List<Long> accountIds, Map<String, Boolean> overrides);
}
