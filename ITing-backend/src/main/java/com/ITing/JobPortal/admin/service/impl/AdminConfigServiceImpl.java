package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.repository.SystemConfigRepository;
import com.iting.jobportal.admin.service.AdminConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminConfigServiceImpl implements AdminConfigService {

    private final SystemConfigRepository systemConfigRepository;

    @Override
    public SystemConfig getConfig() {
        return systemConfigRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultConfig);
    }

    @Override
    @Transactional
    public SystemConfig updateConfig(SystemConfig config, Long adminId) {
        SystemConfig current = getConfig();
        
        // Update all fields (excluding ID)
        current.setSiteName(config.getSiteName());
        current.setSiteUrl(config.getSiteUrl());
        current.setSupportEmail(config.getSupportEmail());
        current.setMaxJobsPerCompany(config.getMaxJobsPerCompany());
        current.setJobExpiryDays(config.getJobExpiryDays());
        current.setAutoApproveVerified(config.getAutoApproveVerified());
        current.setSmtpHost(config.getSmtpHost());
        current.setSmtpPort(config.getSmtpPort());
        current.setSmtpUser(config.getSmtpUser());
        current.setSmtpPassword(config.getSmtpPassword());
        current.setEmailFromName(config.getEmailFromName());
        current.setNotifyNewCompany(config.getNotifyNewCompany());
        current.setNotifyNewJob(config.getNotifyNewJob());
        current.setNotifyUserReport(config.getNotifyUserReport());
        current.setEmailDigest(config.getEmailDigest());
        current.setMaxLoginAttempts(config.getMaxLoginAttempts());
        current.setLockoutDuration(config.getLockoutDuration());
        current.setSessionTimeout(config.getSessionTimeout());
        current.setRequireEmailVerification(config.getRequireEmailVerification());
        current.setEnable2FA(config.getEnable2FA());
        current.setMinPasswordLength(config.getMinPasswordLength());
        current.setMaintenanceMode(config.getMaintenanceMode());
        current.setMaintenanceMessage(config.getMaintenanceMessage());
        current.setAutoBackup(config.getAutoBackup());
        current.setBackupFrequency(config.getBackupFrequency());
        current.setBackupRetention(config.getBackupRetention());
        current.setLastUpdatedBy(adminId);
        
        return systemConfigRepository.save(current);
    }

    @Override
    @Transactional
    public void resetToDefault() {
        systemConfigRepository.deleteAll();
        createDefaultConfig();
    }

    private SystemConfig createDefaultConfig() {
        SystemConfig config = SystemConfig.builder()
                .siteName("ITing")
                .siteUrl("https://iting.vn")
                .supportEmail("support@iting.vn")
                .maxJobsPerCompany(50)
                .jobExpiryDays(30)
                .autoApproveVerified(true)
                .smtpHost("smtp.gmail.com")
                .smtpPort("587")
                .smtpUser("noreply@iting.vn")
                .smtpPassword("password")
                .emailFromName("ITing Vietnam")
                .notifyNewCompany(true)
                .notifyNewJob(true)
                .notifyUserReport(true)
                .emailDigest("daily")
                .maxLoginAttempts(5)
                .lockoutDuration(30)
                .sessionTimeout(60)
                .requireEmailVerification(true)
                .enable2FA(false)
                .minPasswordLength(8)
                .maintenanceMode(false)
                .maintenanceMessage("Hệ thống đang bảo trì. Vui lòng quay lại sau.")
                .autoBackup(true)
                .backupFrequency("daily")
                .backupRetention(30)
                .build();
        return systemConfigRepository.save(config);
    }
}
