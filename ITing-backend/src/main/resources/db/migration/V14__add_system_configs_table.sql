-- Migration V14: Add system_configs table (PostgreSQL Syntax)
CREATE TABLE system_configs (
    id BIGSERIAL PRIMARY KEY,
    
    -- General Settings
    site_name VARCHAR(255),
    site_url VARCHAR(255),
    support_email VARCHAR(255),
    max_jobs_per_company INT,
    job_expiry_days INT,
    auto_approve_verified BOOLEAN DEFAULT TRUE,
    
    -- Email (SMTP) Settings
    smtp_host VARCHAR(255),
    smtp_port VARCHAR(50),
    smtp_user VARCHAR(255),
    smtp_password VARCHAR(255),
    email_from_name VARCHAR(255),
    
    -- Notification Settings
    notify_new_company BOOLEAN DEFAULT TRUE,
    notify_new_job BOOLEAN DEFAULT TRUE,
    notify_user_report BOOLEAN DEFAULT TRUE,
    email_digest VARCHAR(50) DEFAULT 'daily',
    
    -- Security Settings
    max_login_attempts INT DEFAULT 5,
    lockout_duration INT DEFAULT 30,
    session_timeout INT DEFAULT 60,
    require_email_verification BOOLEAN DEFAULT TRUE,
    enable2fa BOOLEAN DEFAULT FALSE,
    min_password_length INT DEFAULT 8,
    
    -- Maintenance & Backup Settings
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    auto_backup BOOLEAN DEFAULT TRUE,
    backup_frequency VARCHAR(50) DEFAULT 'daily',
    backup_retention INT DEFAULT 30,
    
    -- Audit
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_by BIGINT
);

-- Seed initial default configuration
INSERT INTO system_configs (
    site_name, site_url, support_email, max_jobs_per_company, job_expiry_days, auto_approve_verified,
    smtp_host, smtp_port, smtp_user, smtp_password, email_from_name,
    notify_new_company, notify_new_job, notify_user_report, email_digest,
    max_login_attempts, lockout_duration, session_timeout, require_email_verification, enable2fa, min_password_length,
    maintenance_mode, maintenance_message, auto_backup, backup_frequency, backup_retention
) VALUES (
    'ITing', 'https://iting.vn', 'support@iting.vn', 50, 30, true,
    'smtp.gmail.com', '587', 'noreply@iting.vn', 'password', 'ITing Vietnam',
    true, true, true, 'daily',
    5, 30, 60, true, false, 8,
    false, 'Hệ thống đang bảo trì. Vui lòng quay lại sau.', true, 'daily', 30
);
