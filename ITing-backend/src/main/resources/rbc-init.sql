-- ===============================================
-- RBAC INITIALIZATION SCRIPT
-- ===============================================

-- 1. PERMISSIONS
INSERT INTO permissions (code, name, description, module, action, sort_order, active, created_at, updated_at) VALUES
-- User Management
('USER_VIEW', 'View Users', 'Can view user list and details', 'USER', 'VIEW', 1, true, NOW(), NOW()),
('USER_CREATE', 'Create Users', 'Can create new users', 'USER', 'CREATE', 2, true, NOW(), NOW()),
('USER_UPDATE', 'Update Users', 'Can update user information', 'USER', 'UPDATE', 3, true, NOW(), NOW()),
('USER_DELETE', 'Delete Users', 'Can delete users', 'USER', 'DELETE', 4, true, NOW(), NOW()),

-- Job Management
('JOB_VIEW', 'View Jobs', 'Can view job listings', 'JOB', 'VIEW', 10, true, NOW(), NOW()),
('JOB_CREATE', 'Create Jobs', 'Can create new job postings', 'JOB', 'CREATE', 11, true, NOW(), NOW()),
('JOB_UPDATE', 'Update Jobs', 'Can update job information', 'JOB', 'UPDATE', 12, true, NOW(), NOW()),
('JOB_DELETE', 'Delete Jobs', 'Can delete job postings', 'JOB', 'DELETE', 13, true, NOW(), NOW()),
('JOB_APPROVE', 'Approve Jobs', 'Can approve job postings', 'JOB', 'APPROVE', 14, true, NOW(), NOW()),

-- Company Management
('COMPANY_VIEW', 'View Companies', 'Can view company information', 'COMPANY', 'VIEW', 20, true, NOW(), NOW()),
('COMPANY_CREATE', 'Create Companies', 'Can create new companies', 'COMPANY', 'CREATE', 21, true, NOW(), NOW()),
('COMPANY_UPDATE', 'Update Companies', 'Can update company information', 'COMPANY', 'UPDATE', 22, true, NOW(), NOW()),
('COMPANY_DELETE', 'Delete Companies', 'Can delete companies', 'COMPANY', 'DELETE', 23, true, NOW(), NOW()),

-- Application Management
('APPLICATION_VIEW', 'View Applications', 'Can view job applications', 'APPLICATION', 'VIEW', 30, true, NOW(), NOW()),
('APPLICATION_CREATE', 'Create Applications', 'Can submit job applications', 'APPLICATION', 'CREATE', 31, true, NOW(), NOW()),
('APPLICATION_UPDATE', 'Update Applications', 'Can update application status', 'APPLICATION', 'UPDATE', 32, true, NOW(), NOW()),
('APPLICATION_DELETE', 'Delete Applications', 'Can delete applications', 'APPLICATION', 'DELETE', 33, true, NOW(), NOW()),

-- Report Management
('REPORT_VIEW', 'View Reports', 'Can view system reports', 'REPORT', 'VIEW', 40, true, NOW(), NOW()),
('REPORT_CREATE', 'Create Reports', 'Can generate reports', 'REPORT', 'CREATE', 41, true, NOW(), NOW()),
('REPORT_EXPORT', 'Export Reports', 'Can export reports', 'REPORT', 'EXPORT', 42, true, NOW(), NOW()),

-- System Management
('SYSTEM_CONFIG', 'System Configuration', 'Can configure system settings', 'SYSTEM', 'CONFIG', 50, true, NOW(), NOW()),
('SYSTEM_LOGS', 'View System Logs', 'Can view system logs', 'SYSTEM', 'LOGS', 51, true, NOW(), NOW());

-- 2. ROLES
INSERT INTO roles (name, description, created_at, updated_at) VALUES
('ADMIN', 'System Administrator with full access', NOW(), NOW()),
('EMPLOYER', 'Employer who can post and manage jobs', NOW(), NOW()),
('CANDIDATE', 'Job seeker who can view and apply for jobs', NOW(), NOW());

-- 3. ROLE_PERMISSIONS MAPPINGS
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- Employer gets job, company, and application permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'EMPLOYER' AND p.module IN ('JOB', 'COMPANY', 'APPLICATION');

-- Candidate gets view permissions only
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'CANDIDATE' AND p.action = 'VIEW';

-- 4. SAMPLE ACCOUNTS WITH RBAC ROLES
-- Note: Password hash for '123456'
INSERT INTO accounts (email, password_hash, status, created_at, updated_at) VALUES
('admin@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ACTIVE', NOW(), NOW()),
('employer1@company.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ACTIVE', NOW(), NOW()),
('employer2@company.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ACTIVE', NOW(), NOW()),
('candidate1@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ACTIVE', NOW(), NOW()),
('candidate2@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ACTIVE', NOW(), NOW());

-- 5. ACCOUNT_ROLES MAPPINGS
-- Admin gets ADMIN role
INSERT INTO account_roles (account_id, role_id)
SELECT a.id, r.id FROM accounts a, roles r 
WHERE a.email = 'admin@iting.com' AND r.name = 'ADMIN';

-- Employers get EMPLOYER role
INSERT INTO account_roles (account_id, role_id)
SELECT a.id, r.id FROM accounts a, roles r 
WHERE a.email LIKE 'employer%@company.com' AND r.name = 'EMPLOYER';

-- Candidates get CANDIDATE role
INSERT INTO account_roles (account_id, role_id)
SELECT a.id, r.id FROM accounts a, roles r 
WHERE a.email LIKE 'candidate%@gmail.com' AND r.name = 'CANDIDATE';
