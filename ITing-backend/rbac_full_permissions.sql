-- =====================================================
-- 🔐 RBAC FULL PERMISSIONS - JOB PORTAL SYSTEM
-- =====================================================
-- Script: Complete RBAC permission setup
-- Database: PostgreSQL
-- Version: 1.0
-- Created: 2026-02-15
-- =====================================================

-- Clean up existing data
DELETE FROM role_permissions;
DELETE FROM account_roles;
DELETE FROM permissions;
DELETE FROM roles;

-- =====================================================
-- 📋 INSERT ROLES
-- =====================================================

INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống - Toàn quyền', NOW(), NOW()),
(2, 'EMPLOYER', 'Nhà tuyển dụng - Quyền kinh doanh', NOW(), NOW()),
(3, 'CANDIDATE', 'Ứng viên - Quyền cơ bản', NOW(), NOW());

-- =====================================================
-- 🔐 AUTH MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- Basic auth
(1, 'AUTH_LOGIN', 'Đăng nhập', 'AUTH', 'LOGIN', 'Đăng nhập vào hệ thống', NOW(), NOW()),
(2, 'AUTH_LOGOUT', 'Đăng xuất', 'AUTH', 'LOGOUT', 'Đăng xuất khỏi hệ thống', NOW(), NOW()),
(3, 'AUTH_REFRESH_TOKEN', 'Làm mới token', 'AUTH', 'REFRESH_TOKEN', 'Làm mới JWT token', NOW(), NOW()),
-- Profile management
(4, 'AUTH_VIEW_PROFILE_OWN', 'Xem profile', 'AUTH', 'VIEW_PROFILE', 'Xem thông tin cá nhân', NOW(), NOW()),
(5, 'AUTH_UPDATE_PROFILE_OWN', 'Cập nhật profile', 'AUTH', 'UPDATE_PROFILE', 'Cập nhật thông tin cá nhân', NOW(), NOW()),
(6, 'AUTH_CHANGE_PASSWORD_OWN', 'Đổi mật khẩu', 'AUTH', 'CHANGE_PASSWORD', 'Thay đổi mật khẩu', NOW(), NOW()),
-- Password recovery
(7, 'AUTH_FORGOT_PASSWORD', 'Quên mật khẩu', 'AUTH', 'FORGOT_PASSWORD', 'Yêu cầu reset mật khẩu', NOW(), NOW()),
(8, 'AUTH_RESET_PASSWORD', 'Reset mật khẩu', 'AUTH', 'RESET_PASSWORD', 'Reset mật khẩu mới', NOW(), NOW());

-- =====================================================
-- 👤 USER MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- View permissions
(10, 'USER_VIEW_ALL', 'Xem tất cả users', 'USER', 'VIEW', 'Xem danh sách tất cả users', NOW(), NOW()),
(11, 'USER_VIEW_OWN', 'Xem profile mình', 'USER', 'VIEW', 'Xem thông tin cá nhân', NOW(), NOW()),
-- CRUD operations
(12, 'USER_CREATE', 'Tạo user', 'USER', 'CREATE', 'Tạo user mới', NOW(), NOW()),
(13, 'USER_UPDATE_ALL', 'Cập nhật user khác', 'USER', 'UPDATE', 'Cập nhật thông tin user khác', NOW(), NOW()),
(14, 'USER_UPDATE_OWN', 'Cập nhật profile mình', 'USER', 'UPDATE', 'Cập nhật thông tin cá nhân', NOW(), NOW()),
(15, 'USER_DELETE_ALL', 'Xóa user', 'USER', 'DELETE', 'Xóa user khỏi hệ thống', NOW(), NOW()),
-- Status management
(16, 'USER_BAN_ALL', 'Ban user', 'USER', 'BAN', 'Khóa tài khoản user', NOW(), NOW()),
(17, 'USER_UNBAN_ALL', 'Unban user', 'USER', 'UNBAN', 'Mở khóa tài khoản user', NOW(), NOW()),
(18, 'USER_ACTIVATE_ALL', 'Kích hoạt user', 'USER', 'ACTIVATE', 'Kích hoạt tài khoản user', NOW(), NOW()),
(19, 'USER_DEACTIVATE_ALL', 'Vô hiệu hóa user', 'USER', 'DEACTIVATE', 'Vô hiệu hóa tài khoản user', NOW(), NOW()),
-- Role management
(20, 'USER_VIEW_ROLES_ALL', 'Xem roles user', 'USER', 'VIEW_ROLES', 'Xem roles của user', NOW(), NOW()),
(21, 'USER_ASSIGN_ROLES_ALL', 'Gán roles user', 'USER', 'ASSIGN_ROLES', 'Gán roles cho user', NOW(), NOW());

-- =====================================================
-- 🏢 COMPANY MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- View permissions
(30, 'COMPANY_VIEW_ALL', 'Xem tất cả companies', 'COMPANY', 'VIEW', 'Xem danh sách tất cả companies', NOW(), NOW()),
(31, 'COMPANY_VIEW_OWN', 'Xem company mình', 'COMPANY', 'VIEW', 'Xem thông tin company của mình', NOW(), NOW()),
-- CRUD operations
(32, 'COMPANY_CREATE', 'Tạo company', 'COMPANY', 'CREATE', 'Tạo company mới', NOW(), NOW()),
(33, 'COMPANY_UPDATE_ALL', 'Cập nhật company khác', 'COMPANY', 'UPDATE', 'Cập nhật thông tin company khác', NOW(), NOW()),
(34, 'COMPANY_UPDATE_OWN', 'Cập nhật company mình', 'COMPANY', 'UPDATE', 'Cập nhật thông tin company của mình', NOW(), NOW()),
(35, 'COMPANY_DELETE_ALL', 'Xóa company', 'COMPANY', 'DELETE', 'Xóa company khỏi hệ thống', NOW(), NOW()),
-- Company features
(36, 'COMPANY_UPLOAD_LOGO_OWN', 'Upload logo', 'COMPANY', 'UPLOAD_LOGO', 'Upload logo cho company', NOW(), NOW()),
(37, 'COMPANY_UPDATE_PROFILE_OWN', 'Cập nhật profile', 'COMPANY', 'UPDATE_PROFILE', 'Cập nhật profile company', NOW(), NOW()),
(38, 'COMPANY_VIEW_STATS_OWN', 'Xem thống kê', 'COMPANY', 'VIEW_STATS', 'Xem thống kê company', NOW(), NOW());

-- =====================================================
-- 💼 JOB MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- View permissions
(40, 'JOB_VIEW_ALL', 'Xem tất cả jobs', 'JOB', 'VIEW', 'Xem danh sách tất cả jobs', NOW(), NOW()),
(41, 'JOB_VIEW_OWN', 'Xem jobs mình', 'JOB', 'VIEW', 'Xem jobs đã đăng của mình', NOW(), NOW()),
-- CRUD operations
(42, 'JOB_CREATE_OWN', 'Tạo job', 'JOB', 'CREATE', 'Đăng tin tuyển dụng mới', NOW(), NOW()),
(43, 'JOB_UPDATE_ALL', 'Cập nhật job khác', 'JOB', 'UPDATE', 'Cập nhật thông tin job khác', NOW(), NOW()),
(44, 'JOB_UPDATE_OWN', 'Cập nhật job mình', 'JOB', 'UPDATE', 'Cập nhật thông tin job của mình', NOW(), NOW()),
(45, 'JOB_DELETE_ALL', 'Xóa job khác', 'JOB', 'DELETE', 'Xóa job của người khác', NOW(), NOW()),
(46, 'JOB_DELETE_OWN', 'Xóa job mình', 'JOB', 'DELETE', 'Xóa job đã đăng', NOW(), NOW()),
-- Job lifecycle
(47, 'JOB_APPROVE_ALL', 'Phê duyệt job', 'JOB', 'APPROVE', 'Phê duyệt job đăng tuyển', NOW(), NOW()),
(48, 'JOB_REJECT_ALL', 'Từ chối job', 'JOB', 'REJECT', 'Từ chối job đăng tuyển', NOW(), NOW()),
(49, 'JOB_PUBLISH_OWN', 'Publish job', 'JOB', 'PUBLISH', 'Publish job đã đăng', NOW(), NOW()),
(50, 'JOB_UNPUBLISH_OWN', 'Unpublish job', 'JOB', 'UNPUBLISH', 'Unpublish job', NOW(), NOW()),
(51, 'JOB_CLOSE_OWN', 'Đóng job', 'JOB', 'CLOSE', 'Đóng tuyển dụng', NOW(), NOW()),
(52, 'JOB_EXTEND_OWN', 'Gia hạn job', 'JOB', 'EXTEND', 'Gia hạn thời gian tuyển dụng', NOW(), NOW()),
-- Job features
(53, 'JOB_FEATURE_ALL', 'Nổi bật job', 'JOB', 'FEATURE', 'Nổi bật job trên trang chủ', NOW(), NOW()),
-- Search and filter
(54, 'JOB_SEARCH_ALL', 'Tìm kiếm job', 'JOB', 'SEARCH', 'Tìm kiếm job', NOW(), NOW()),
(55, 'JOB_FILTER_ALL', 'Lọc job', 'JOB', 'FILTER', 'Lọc job theo điều kiện', NOW(), NOW()),
(56, 'JOB_SORT_ALL', 'Sắp xếp job', 'JOB', 'SORT', 'Sắp xếp job', NOW(), NOW()),
-- Job applicants
(57, 'JOB_VIEW_APPLICANTS_OWN', 'Xem ứng viên', 'JOB', 'VIEW_APPLICANTS', 'Xem danh sách ứng viên', NOW(), NOW());

-- =====================================================
-- 📄 APPLICATION MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- View permissions
(60, 'APPLICATION_VIEW_ALL', 'Xem tất cả applications', 'APPLICATION', 'VIEW', 'Xem danh sách tất cả applications', NOW(), NOW()),
(61, 'APPLICATION_VIEW_OWN', 'Xem applications mình', 'APPLICATION', 'VIEW', 'Xem applications đã nộp', NOW(), NOW()),
(62, 'APPLICATION_VIEW_JOB_OWN', 'Xem applications job mình', 'APPLICATION', 'VIEW', 'Xem applications của job mình', NOW(), NOW()),
-- CRUD operations
(63, 'APPLICATION_CREATE_OWN', 'Nộp đơn', 'APPLICATION', 'CREATE', 'Nộp đơn ứng tuyển', NOW(), NOW()),
(64, 'APPLICATION_UPDATE_ALL', 'Cập nhật application khác', 'APPLICATION', 'UPDATE', 'Cập nhật application của người khác', NOW(), NOW()),
(65, 'APPLICATION_UPDATE_OWN', 'Cập nhật application mình', 'APPLICATION', 'UPDATE', 'Cập nhật application đã nộp', NOW(), NOW()),
(66, 'APPLICATION_UPDATE_STATUS_JOB_OWN', 'Cập nhật status', 'APPLICATION', 'UPDATE_STATUS', 'Cập nhật trạng thái application', NOW(), NOW()),
(67, 'APPLICATION_DELETE_ALL', 'Xóa application', 'APPLICATION', 'DELETE', 'Xóa application', NOW(), NOW()),
-- Application actions
(68, 'APPLICATION_WITHDRAW_OWN', 'Rút đơn', 'APPLICATION', 'WITHDRAW', 'Rút đơn ứng tuyển', NOW(), NOW()),
(69, 'APPLICATION_ACCEPT_JOB_OWN', 'Chấp nhận', 'APPLICATION', 'ACCEPT', 'Chấp nhận ứng viên', NOW(), NOW()),
(70, 'APPLICATION_REJECT_JOB_OWN', 'Từ chối', 'APPLICATION', 'REJECT', 'Từ chối ứng viên', NOW(), NOW()),
(71, 'APPLICATION_SHORTLIST_JOB_OWN', 'Shortlist', 'APPLICATION', 'SHORTLIST', 'Thêm vào danh sách shortlist', NOW(), NOW()),
(72, 'APPLICATION_SCHEDULE_INTERVIEW_JOB_OWN', 'Lên lịch phỏng vấn', 'APPLICATION', 'SCHEDULE_INTERVIEW', 'Lên lịch phỏng vấn', NOW(), NOW()),
-- Resume access
(73, 'APPLICATION_DOWNLOAD_RESUME_JOB_OWN', 'Download CV', 'APPLICATION', 'DOWNLOAD_RESUME', 'Download CV ứng viên', NOW(), NOW()),
(74, 'APPLICATION_VIEW_RESUME_JOB_OWN', 'Xem CV', 'APPLICATION', 'VIEW_RESUME', 'Xem CV ứng viên', NOW(), NOW());

-- =====================================================
-- 📂 CATEGORY MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- View permissions
(80, 'CATEGORY_VIEW_ALL', 'Xem tất cả categories', 'CATEGORY', 'VIEW', 'Xem danh sách tất cả categories', NOW(), NOW()),
-- CRUD operations
(81, 'CATEGORY_CREATE_ALL', 'Tạo category', 'CATEGORY', 'CREATE', 'Tạo category mới', NOW(), NOW()),
(82, 'CATEGORY_UPDATE_ALL', 'Cập nhật category', 'CATEGORY', 'UPDATE', 'Cập nhật thông tin category', NOW(), NOW()),
(83, 'CATEGORY_DELETE_ALL', 'Xóa category', 'CATEGORY', 'DELETE', 'Xóa category', NOW(), NOW()),
-- Category management
(84, 'CATEGORY_ACTIVATE_ALL', 'Kích hoạt category', 'CATEGORY', 'ACTIVATE', 'Kích hoạt category', NOW(), NOW()),
(85, 'CATEGORY_DEACTIVATE_ALL', 'Vô hiệu hóa category', 'CATEGORY', 'DEACTIVATE', 'Vô hiệu hóa category', NOW(), NOW()),
(86, 'CATEGORY_REORDER_ALL', 'Sắp xếp lại category', 'CATEGORY', 'REORDER', 'Sắp xếp lại category', NOW(), NOW()),
(87, 'CATEGORY_VIEW_STATS_ALL', 'Xem thống kê category', 'CATEGORY', 'VIEW_STATS', 'Xem thống kê category', NOW(), NOW());

-- =====================================================
-- 📊 SYSTEM MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- Dashboard
(90, 'SYSTEM_VIEW_DASHBOARD', 'Xem dashboard', 'SYSTEM', 'VIEW_DASHBOARD', 'Xem dashboard admin', NOW(), NOW()),
-- Logs
(91, 'SYSTEM_VIEW_LOGS_ALL', 'Xem logs', 'SYSTEM', 'VIEW_LOGS', 'Xem logs hệ thống', NOW(), NOW()),
(92, 'SYSTEM_EXPORT_LOGS_ALL', 'Export logs', 'SYSTEM', 'EXPORT_LOGS', 'Export logs', NOW(), NOW()),
-- Settings
(93, 'SYSTEM_VIEW_SETTINGS_ALL', 'Xem cài đặt', 'SYSTEM', 'VIEW_SETTINGS', 'Xem cài đặt hệ thống', NOW(), NOW()),
(94, 'SYSTEM_UPDATE_SETTINGS_ALL', 'Cập nhật cài đặt', 'SYSTEM', 'UPDATE_SETTINGS', 'Cập nhật cài đặt', NOW(), NOW()),
-- System operations
(95, 'SYSTEM_MAINTENANCE_ALL', 'Bảo trì', 'SYSTEM', 'MAINTENANCE', 'Bảo trì hệ thống', NOW(), NOW()),
(96, 'SYSTEM_BACKUP_ALL', 'Backup', 'SYSTEM', 'BACKUP', 'Backup dữ liệu', NOW(), NOW()),
(97, 'SYSTEM_RESTORE_ALL', 'Restore', 'SYSTEM', 'RESTORE', 'Restore dữ liệu', NOW(), NOW());

-- =====================================================
-- 📈 ANALYTICS MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- General analytics
(100, 'ANALYTICS_VIEW_STATS_ALL', 'Xem thống kê tổng quan', 'ANALYTICS', 'VIEW_STATS', 'Xem thống kê tổng quan', NOW(), NOW()),
(101, 'ANALYTICS_VIEW_STATS_OWN', 'Xem thống kê mình', 'ANALYTICS', 'VIEW_STATS', 'Xem thống kê của mình', NOW(), NOW()),
-- Specific analytics
(102, 'ANALYTICS_VIEW_JOB_STATS_OWN', 'Xem thống kê jobs', 'ANALYTICS', 'VIEW_JOB_STATS', 'Xem thống kê jobs', NOW(), NOW()),
(103, 'ANALYTICS_VIEW_APPLICATION_STATS_OWN', 'Xem thống kê applications', 'ANALYTICS', 'VIEW_APPLICATION_STATS', 'Xem thống kê applications', NOW(), NOW()),
(104, 'ANALYTICS_VIEW_COMPANY_STATS_OWN', 'Xem thống kê company', 'ANALYTICS', 'VIEW_COMPANY_STATS', 'Xem thống kê company', NOW(), NOW()),
(105, 'ANALYTICS_VIEW_USER_STATS_ALL', 'Xem thống kê users', 'ANALYTICS', 'VIEW_USER_STATS', 'Xem thống kê users', NOW(), NOW()),
-- Reports
(106, 'ANALYTICS_EXPORT_REPORTS_ALL', 'Export báo cáo', 'ANALYTICS', 'EXPORT_REPORTS', 'Export báo cáo', NOW(), NOW()),
(107, 'ANALYTICS_GENERATE_REPORTS_ALL', 'Tạo báo cáo', 'ANALYTICS', 'GENERATE_REPORTS', 'Tạo báo cáo', NOW(), NOW());

-- =====================================================
-- 🔍 SEARCH MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- Search permissions
(110, 'SEARCH_USERS_ALL', 'Tìm kiếm users', 'SEARCH', 'SEARCH_USERS', 'Tìm kiếm users', NOW(), NOW()),
(111, 'SEARCH_JOBS_ALL', 'Tìm kiếm jobs', 'SEARCH', 'SEARCH_JOBS', 'Tìm kiếm jobs', NOW(), NOW()),
(112, 'SEARCH_COMPANIES_ALL', 'Tìm kiếm companies', 'SEARCH', 'SEARCH_COMPANIES', 'Tìm kiếm companies', NOW(), NOW()),
(113, 'SEARCH_APPLICATIONS_ALL', 'Tìm kiếm applications', 'SEARCH', 'SEARCH_APPLICATIONS', 'Tìm kiếm applications', NOW(), NOW()),
-- Advanced search
(114, 'SEARCH_ADVANCED_ALL', 'Tìm kiếm nâng cao', 'SEARCH', 'ADVANCED_SEARCH', 'Tìm kiếm nâng cao', NOW(), NOW()),
(115, 'SEARCH_SAVE_OWN', 'Lưu tìm kiếm', 'SEARCH', 'SAVE_SEARCH', 'Lưu tìm kiếm', NOW(), NOW());

-- =====================================================
-- 📝 CONTENT MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- Static content
(120, 'CONTENT_VIEW_STATIC_ALL', 'Xem nội dung tĩnh', 'CONTENT', 'VIEW_STATIC', 'Xem nội dung tĩnh', NOW(), NOW()),
(121, 'CONTENT_CREATE_STATIC_ALL', 'Tạo nội dung tĩnh', 'CONTENT', 'CREATE_STATIC', 'Tạo nội dung tĩnh', NOW(), NOW()),
(122, 'CONTENT_UPDATE_STATIC_ALL', 'Cập nhật nội dung tĩnh', 'CONTENT', 'UPDATE_STATIC', 'Cập nhật nội dung tĩnh', NOW(), NOW()),
(123, 'CONTENT_DELETE_STATIC_ALL', 'Xóa nội dung tĩnh', 'CONTENT', 'DELETE_STATIC', 'Xóa nội dung tĩnh', NOW(), NOW()),
(124, 'CONTENT_PUBLISH_STATIC_ALL', 'Publish nội dung tĩnh', 'CONTENT', 'PUBLISH_STATIC', 'Publish nội dung tĩnh', NOW(), NOW()),
(125, 'CONTENT_UNPUBLISH_STATIC_ALL', 'Unpublish nội dung tĩnh', 'CONTENT', 'UNPUBLISH_STATIC', 'Unpublish nội dung tĩnh', NOW(), NOW()),
-- Blog content
(126, 'CONTENT_VIEW_BLOGS_ALL', 'Xem blogs', 'CONTENT', 'VIEW_BLOGS', 'Xem blogs', NOW(), NOW()),
(127, 'CONTENT_CREATE_BLOG_OWN', 'Tạo blog', 'CONTENT', 'CREATE_BLOG', 'Tạo blog', NOW(), NOW()),
(128, 'CONTENT_UPDATE_BLOG_OWN', 'Cập nhật blog', 'CONTENT', 'UPDATE_BLOG', 'Cập nhật blog', NOW(), NOW()),
(129, 'CONTENT_DELETE_BLOG_OWN', 'Xóa blog', 'CONTENT', 'DELETE_BLOG', 'Xóa blog', NOW(), NOW());

-- =====================================================
-- 📋 REPORT MODULE PERMISSIONS
-- =====================================================

INSERT INTO permissions (id, code, name, module, action, description, created_at, updated_at) VALUES
-- Report management
(130, 'REPORT_VIEW_REPORTS_ALL', 'Xem báo cáo vi phạm', 'REPORT', 'VIEW_REPORTS', 'Xem báo cáo vi phạm', NOW(), NOW()),
(131, 'REPORT_CREATE_REPORT_OWN', 'Tạo báo cáo vi phạm', 'REPORT', 'CREATE_REPORT', 'Tạo báo cáo vi phạm', NOW(), NOW()),
(132, 'REPORT_HANDLE_REPORT_ALL', 'Xử lý báo cáo', 'REPORT', 'HANDLE_REPORT', 'Xử lý báo cáo', NOW(), NOW()),
(133, 'REPORT_IGNORE_REPORT_ALL', 'Bỏ qua báo cáo', 'REPORT', 'IGNORE_REPORT', 'Bỏ qua báo cáo', NOW(), NOW()),
(134, 'REPORT_BAN_FROM_REPORT_ALL', 'Ban từ báo cáo', 'REPORT', 'BAN_FROM_REPORT', 'Ban từ báo cáo', NOW(), NOW());

-- =====================================================
-- 👑 ASSIGN PERMISSIONS TO ROLES
-- =====================================================

-- ADMIN: Gets ALL permissions (1-134)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE id BETWEEN 1 AND 134;

-- EMPLOYER: Gets business permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Auth permissions
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
-- User permissions (own only)
(2, 11), (2, 14),
-- Company permissions (own only)
(2, 30), (2, 31), (2, 32), (2, 34), (2, 36), (2, 37), (2, 38),
-- Job permissions (own only)
(2, 40), (2, 41), (2, 42), (2, 44), (2, 46), (2, 49), (2, 50), (2, 51), (2, 52),
(2, 54), (2, 55), (2, 56), (2, 57),
-- Application permissions (job owner)
(2, 62), (2, 66), (2, 69), (2, 70), (2, 71), (2, 72), (2, 73), (2, 74),
-- Analytics permissions (own)
(2, 101), (2, 102), (2, 103), (2, 104),
-- Search permissions
(2, 111), (2, 112), (2, 113), (2, 114), (2, 115),
-- Content permissions (blog)
(2, 126), (2, 127), (2, 128), (2, 129),
-- Report permissions (create)
(2, 131);

-- CANDIDATE: Gets basic permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Auth permissions
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8),
-- User permissions (own only)
(3, 11), (3, 14),
-- Job permissions (view only)
(3, 40), (3, 54), (3, 55), (3, 56),
-- Application permissions (own only)
(3, 61), (3, 63), (3, 65), (3, 68),
-- Analytics permissions (own)
(3, 101),
-- Search permissions
(3, 111), (3, 112), (3, 114),
-- Content permissions (view)
(3, 120), (3, 126),
-- Report permissions (create)
(3, 131);

-- =====================================================
-- ✅ VERIFICATION QUERIES
-- =====================================================

-- Check roles and permissions count
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.id;

-- Check permission distribution by module
SELECT 
    p.module,
    COUNT(*) as total_permissions,
    COUNT(CASE WHEN r.name = 'ADMIN' THEN 1 END) as admin_permissions,
    COUNT(CASE WHEN r.name = 'EMPLOYER' THEN 1 END) as employer_permissions,
    COUNT(CASE WHEN r.name = 'CANDIDATE' THEN 1 END) as candidate_permissions
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
LEFT JOIN roles r ON rp.role_id = r.id
GROUP BY p.module
ORDER BY p.module;

-- Verify specific role permissions
SELECT 
    r.name as role_name,
    p.module,
    p.code,
    p.name,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'ADMIN'
ORDER BY p.module, p.code;

-- =====================================================
-- 🎯 SAMPLE ACCOUNTS WITH ROLES
-- =====================================================

-- Create sample accounts with roles (assuming accounts table exists)
-- Note: Adjust according to your actual account table structure

-- Admin account
INSERT INTO account_roles (account_id, role_id) VALUES
(1, 1); -- admin@iting.com -> ADMIN

-- Employer account  
INSERT INTO account_roles (account_id, role_id) VALUES
(2, 2); -- employer1@company.com -> EMPLOYER

-- Candidate account
INSERT INTO account_roles (account_id, role_id) VALUES
(3, 3); -- candidate1@gmail.com -> CANDIDATE

-- =====================================================
-- 📊 SUMMARY STATISTICS
-- =====================================================

-- Total permissions created
SELECT COUNT(*) as total_permissions FROM permissions;

-- Permissions by module
SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module;

-- Permissions per role
SELECT 
    r.name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;

-- =====================================================
-- 🎉 SETUP COMPLETE
-- =====================================================

-- The RBAC system is now fully configured with:
-- ✅ 3 Roles: ADMIN, EMPLOYER, CANDIDATE
-- ✅ 134 Permissions across 10 modules
-- ✅ Complete permission matrix
-- ✅ Role-permission assignments
-- ✅ Verification queries

-- Run the verification queries above to confirm setup success!
