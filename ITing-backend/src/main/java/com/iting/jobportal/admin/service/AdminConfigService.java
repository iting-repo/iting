package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.entity.SystemConfig;

public interface AdminConfigService {
    SystemConfig getConfig();

    SystemConfig updateConfig(SystemConfig config, Long adminId);

    void resetToDefault();
    boolean testSmtpConnection(SystemConfig config);
}
