-- V113: Full RBAC model — tách quyền nền tảng (PLATFORM) và quyền doanh nghiệp (COMPANY),
-- catalog permission có namespace/scope/risk_level, role có vòng đời duyệt
-- (DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → ACTIVE/DISABLED),
-- và phân loại tài khoản (account_type) để chặn user công khai nhận role nội bộ.
--
-- Nguyên tắc thiết kế: least privilege + approval workflow + audit.
-- Gán quyền theo mô hình: User → Role → Permission (không gán permission trực tiếp,
-- per-user override đã có ở bảng user_permission_overrides cho trường hợp đặc biệt).

-- ──────────────────────────────────────────────────────────────────────────
-- 1) Phân loại tài khoản trên Account
--    PUBLIC        : Candidate đăng ký Gmail/email  → không nhận role nội bộ ITing
--    COMPANY_STAFF : HR thuộc một công ty           → chỉ nhận company role
--    INTERNAL_STAFF: Nhân sự nội bộ ITing           → có thể nhận platform role
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE account
    ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) NOT NULL DEFAULT 'PUBLIC';

-- Backfill từ role hiện có (USER/COMPANY là legacy của CANDIDATE/EMPLOYER)
UPDATE account SET account_type = 'INTERNAL_STAFF' WHERE role = 'ADMIN';
UPDATE account SET account_type = 'COMPANY_STAFF'  WHERE role IN ('EMPLOYER', 'COMPANY');
UPDATE account SET account_type = 'PUBLIC'         WHERE role IN ('CANDIDATE', 'USER');

-- ──────────────────────────────────────────────────────────────────────────
-- 2) Catalog permission
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rbac_permission (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,           -- vd: platform.users.delete
    name        VARCHAR(150) NOT NULL,                  -- nhãn hiển thị tiếng Việt
    module      VARCHAR(50)  NOT NULL,                  -- USER, JOB, COMPANY, REPORT, CMS, SYSTEM, FINANCE...
    scope       VARCHAR(20)  NOT NULL,                  -- PLATFORM | COMPANY
    risk_level  VARCHAR(20)  NOT NULL DEFAULT 'LOW',    -- LOW | MEDIUM | HIGH
    description VARCHAR(300),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rbac_permission_scope ON rbac_permission(scope);

-- ──────────────────────────────────────────────────────────────────────────
-- 3) Role (platform & company) với vòng đời duyệt
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rbac_role (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(60)  NOT NULL UNIQUE,         -- vd: SUPER_ADMIN, AI_REVIEWER, HR_MANAGER
    name          VARCHAR(120) NOT NULL,
    description   VARCHAR(300),
    scope         VARCHAR(20)  NOT NULL,                -- PLATFORM | COMPANY
    status        VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',-- DRAFT|PENDING_APPROVAL|APPROVED|REJECTED|ACTIVE|DISABLED
    system_role   BOOLEAN      NOT NULL DEFAULT FALSE,  -- role hệ thống không cho xóa
    reason        VARCHAR(500),                         -- lý do tạo role (gửi duyệt)
    reject_reason VARCHAR(500),
    created_by    BIGINT,
    approved_by   BIGINT,
    approved_at   TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rbac_role_created_by  FOREIGN KEY (created_by)  REFERENCES Account(Id) ON DELETE SET NULL,
    CONSTRAINT fk_rbac_role_approved_by FOREIGN KEY (approved_by) REFERENCES Account(Id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_rbac_role_scope  ON rbac_role(scope);
CREATE INDEX IF NOT EXISTS idx_rbac_role_status ON rbac_role(status);

-- ──────────────────────────────────────────────────────────────────────────
-- 4) Liên kết role ↔ permission (theo code permission)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rbac_role_permission (
    id              BIGSERIAL PRIMARY KEY,
    role_id         BIGINT       NOT NULL,
    permission_code VARCHAR(100) NOT NULL,
    CONSTRAINT fk_rrp_role FOREIGN KEY (role_id) REFERENCES rbac_role(id) ON DELETE CASCADE,
    CONSTRAINT uq_rrp_role_perm UNIQUE (role_id, permission_code)
);
CREATE INDEX IF NOT EXISTS idx_rrp_role_id ON rbac_role_permission(role_id);

-- ──────────────────────────────────────────────────────────────────────────
-- 5) Seed permission catalog
-- ──────────────────────────────────────────────────────────────────────────
INSERT INTO rbac_permission (code, name, module, scope, risk_level, description) VALUES
  -- PLATFORM · Người dùng
  ('platform.users.view',        'Xem người dùng',            'USER',   'PLATFORM', 'LOW',    'Xem danh sách & hồ sơ người dùng'),
  ('platform.users.create',      'Tạo tài khoản',             'USER',   'PLATFORM', 'MEDIUM', 'Tạo tài khoản trong hệ thống'),
  ('platform.users.edit',        'Chỉnh sửa người dùng',      'USER',   'PLATFORM', 'MEDIUM', 'Cập nhật thông tin người dùng'),
  ('platform.users.ban',         'Khóa / Mở khóa',            'USER',   'PLATFORM', 'MEDIUM', 'Khóa hoặc mở khóa tài khoản'),
  ('platform.users.delete',      'Xóa tài khoản',             'USER',   'PLATFORM', 'HIGH',   'Xóa vĩnh viễn tài khoản'),
  ('platform.users.export',      'Xuất danh sách',            'USER',   'PLATFORM', 'MEDIUM', 'Xuất dữ liệu người dùng'),
  -- PLATFORM · Công ty
  ('platform.companies.view',    'Xem công ty',               'COMPANY','PLATFORM', 'LOW',    'Xem danh sách & hồ sơ công ty'),
  ('platform.companies.approve', 'Duyệt công ty',             'COMPANY','PLATFORM', 'MEDIUM', 'Duyệt / từ chối hồ sơ công ty (KYB)'),
  ('platform.companies.suspend', 'Đình chỉ công ty',          'COMPANY','PLATFORM', 'MEDIUM', 'Đình chỉ / khôi phục công ty'),
  -- PLATFORM · Công việc
  ('platform.jobs.view',         'Xem tin tuyển dụng',        'JOB',    'PLATFORM', 'LOW',    'Xem mọi tin tuyển dụng'),
  ('platform.jobs.approve',      'Duyệt tin tuyển dụng',      'JOB',    'PLATFORM', 'MEDIUM', 'Duyệt tin tuyển dụng'),
  ('platform.jobs.reject',       'Từ chối tin tuyển dụng',    'JOB',    'PLATFORM', 'MEDIUM', 'Từ chối tin tuyển dụng'),
  ('platform.jobs.ai_review',    'Kiểm duyệt AI',             'JOB',    'PLATFORM', 'LOW',    'Xem / chạy lại kết quả kiểm duyệt AI'),
  -- PLATFORM · Ứng tuyển & Báo cáo
  ('platform.applications.view', 'Xem đơn ứng tuyển',         'APPLICATION','PLATFORM','LOW', 'Xem đơn ứng tuyển toàn hệ thống'),
  ('platform.reports.view',      'Xem báo cáo vi phạm',       'REPORT', 'PLATFORM', 'LOW',    'Xem báo cáo vi phạm'),
  ('platform.reports.manage',    'Xử lý báo cáo',             'REPORT', 'PLATFORM', 'MEDIUM', 'Xử lý / đóng báo cáo vi phạm'),
  -- PLATFORM · Hệ thống & Phân quyền
  ('platform.audit.view',        'Xem nhật ký kiểm tra',      'SYSTEM', 'PLATFORM', 'HIGH',   'Xem audit log toàn hệ thống'),
  ('platform.roles.view',        'Xem phân quyền',            'SYSTEM', 'PLATFORM', 'LOW',    'Xem vai trò & quyền hạn'),
  ('platform.roles.manage',      'Quản lý phân quyền',        'SYSTEM', 'PLATFORM', 'HIGH',   'Tạo / sửa vai trò & quyền hạn'),
  ('platform.roles.approve',     'Duyệt vai trò',             'SYSTEM', 'PLATFORM', 'HIGH',   'Duyệt / từ chối vai trò chờ duyệt'),
  ('platform.system.config',     'Cấu hình hệ thống',         'SYSTEM', 'PLATFORM', 'HIGH',   'Thay đổi cấu hình hệ thống'),
  ('platform.cms.manage',        'Quản lý CMS',               'CMS',    'PLATFORM', 'LOW',    'Quản lý blog, FAQ, banner, trang tĩnh'),
  ('platform.notifications.send','Gửi thông báo hệ thống',    'CMS',    'PLATFORM', 'MEDIUM', 'Gửi thông báo / email broadcast'),
  ('platform.finance.view',      'Xem tài chính',             'FINANCE','PLATFORM', 'MEDIUM', 'Xem payment, invoice, đối soát doanh thu'),
  -- COMPANY · Hồ sơ & Thành viên
  ('company.profile.view',         'Xem hồ sơ công ty',       'COMPANY','COMPANY', 'LOW',    'Xem hồ sơ công ty'),
  ('company.profile.edit',         'Sửa hồ sơ công ty',       'COMPANY','COMPANY', 'MEDIUM', 'Chỉnh sửa hồ sơ công ty'),
  ('company.members.invite',       'Mời thành viên',          'COMPANY','COMPANY', 'MEDIUM', 'Mời HR con vào công ty'),
  ('company.members.remove',       'Gỡ thành viên',           'COMPANY','COMPANY', 'MEDIUM', 'Gỡ HR khỏi công ty'),
  ('company.members.assign_role',  'Phân quyền thành viên',   'COMPANY','COMPANY', 'HIGH',   'Gán company role cho HR con'),
  -- COMPANY · Tuyển dụng
  ('company.jobs.create',          'Đăng tin',                'JOB',    'COMPANY', 'LOW',    'Tạo tin tuyển dụng của công ty'),
  ('company.jobs.edit',            'Sửa tin',                 'JOB',    'COMPANY', 'LOW',    'Chỉnh sửa tin tuyển dụng'),
  ('company.jobs.delete',          'Xóa tin',                 'JOB',    'COMPANY', 'MEDIUM', 'Xóa tin tuyển dụng'),
  ('company.jobs.view_applicants', 'Xem ứng viên',            'JOB',    'COMPANY', 'LOW',    'Xem ứng viên ứng tuyển'),
  ('company.applications.update_status','Cập nhật trạng thái ứng tuyển','APPLICATION','COMPANY','LOW','Cập nhật trạng thái đơn ứng tuyển'),
  -- COMPANY · Thanh toán & Báo cáo
  ('company.billing.view',         'Xem hóa đơn',             'FINANCE','COMPANY', 'LOW',    'Xem gói & hóa đơn của công ty'),
  ('company.billing.pay',          'Thanh toán',              'FINANCE','COMPANY', 'HIGH',   'Mua gói / thanh toán cho công ty'),
  ('company.reports.view',         'Xem báo cáo tuyển dụng',  'REPORT', 'COMPANY', 'LOW',    'Xem báo cáo tuyển dụng của công ty')
ON CONFLICT (code) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────
-- 6) Seed system roles (ACTIVE, system_role = TRUE)
-- ──────────────────────────────────────────────────────────────────────────
INSERT INTO rbac_role (code, name, description, scope, status, system_role) VALUES
  ('SUPER_ADMIN',     'Super Admin',         'Quyền cao nhất, duyệt role & cấu hình hệ thống',     'PLATFORM', 'ACTIVE', TRUE),
  ('ADMIN',           'Quản trị viên',       'Quản trị vận hành: user, công ty, job, báo cáo',     'PLATFORM', 'ACTIVE', TRUE),
  ('MODERATOR',       'Kiểm duyệt viên',     'Kiểm duyệt nội dung job & công ty',                  'PLATFORM', 'ACTIVE', TRUE),
  ('CONTENT_MANAGER', 'Quản lý nội dung',    'Quản lý CMS: blog, FAQ, banner, thông báo',         'PLATFORM', 'ACTIVE', TRUE),
  ('SUPPORT_STAFF',   'Nhân viên hỗ trợ',    'Hỗ trợ người dùng, xử lý khiếu nại',                'PLATFORM', 'ACTIVE', TRUE),
  ('FINANCE_STAFF',   'Nhân viên tài chính', 'Xem payment, invoice, đối soát doanh thu',          'PLATFORM', 'ACTIVE', TRUE),
  ('AI_REVIEWER',     'Kiểm duyệt AI',       'Xem & chạy lại kết quả kiểm duyệt AI',              'PLATFORM', 'ACTIVE', TRUE),
  ('SUPER_HR',        'Super HR',            'Người đại diện công ty, toàn quyền trong công ty',   'COMPANY',  'ACTIVE', TRUE),
  ('HR_MANAGER',      'HR Manager',          'Quản lý tuyển dụng & phân công recruiter',          'COMPANY',  'ACTIVE', TRUE),
  ('HR_RECRUITER',    'HR Recruiter',        'Xử lý ứng viên được phân công',                     'COMPANY',  'ACTIVE', TRUE),
  ('HR_VIEWER',       'HR Viewer',           'Chỉ xem job & ứng viên, không chỉnh sửa',           'COMPANY',  'ACTIVE', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────
-- 7) Seed role ↔ permission
-- ──────────────────────────────────────────────────────────────────────────
-- SUPER_ADMIN: toàn bộ permission PLATFORM
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, p.code FROM rbac_role r CROSS JOIN rbac_permission p
WHERE r.code = 'SUPER_ADMIN' AND p.scope = 'PLATFORM'
ON CONFLICT DO NOTHING;

-- ADMIN: vận hành, không có roles.manage/approve, system.config, finance
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES
  ('platform.users.view'),('platform.users.create'),('platform.users.edit'),('platform.users.ban'),('platform.users.export'),
  ('platform.companies.view'),('platform.companies.approve'),('platform.companies.suspend'),
  ('platform.jobs.view'),('platform.jobs.approve'),('platform.jobs.reject'),('platform.jobs.ai_review'),
  ('platform.applications.view'),('platform.reports.view'),('platform.reports.manage'),
  ('platform.audit.view'),('platform.roles.view'),('platform.cms.manage'),('platform.notifications.send')
) AS c(code) WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- MODERATOR
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES
  ('platform.jobs.view'),('platform.jobs.approve'),('platform.jobs.reject'),('platform.jobs.ai_review'),
  ('platform.companies.view'),('platform.reports.view'),('platform.reports.manage'),('platform.applications.view')
) AS c(code) WHERE r.code = 'MODERATOR'
ON CONFLICT DO NOTHING;

-- CONTENT_MANAGER
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES ('platform.cms.manage'),('platform.notifications.send')) AS c(code)
WHERE r.code = 'CONTENT_MANAGER'
ON CONFLICT DO NOTHING;

-- SUPPORT_STAFF
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES ('platform.users.view'),('platform.users.ban'),('platform.reports.view'),('platform.applications.view')) AS c(code)
WHERE r.code = 'SUPPORT_STAFF'
ON CONFLICT DO NOTHING;

-- FINANCE_STAFF
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES ('platform.finance.view'),('platform.companies.view')) AS c(code)
WHERE r.code = 'FINANCE_STAFF'
ON CONFLICT DO NOTHING;

-- AI_REVIEWER
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES ('platform.jobs.view'),('platform.jobs.ai_review')) AS c(code)
WHERE r.code = 'AI_REVIEWER'
ON CONFLICT DO NOTHING;

-- SUPER_HR: toàn bộ permission COMPANY
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, p.code FROM rbac_role r CROSS JOIN rbac_permission p
WHERE r.code = 'SUPER_HR' AND p.scope = 'COMPANY'
ON CONFLICT DO NOTHING;

-- HR_MANAGER
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES
  ('company.profile.view'),('company.jobs.create'),('company.jobs.edit'),('company.jobs.delete'),
  ('company.jobs.view_applicants'),('company.applications.update_status'),('company.reports.view')
) AS c(code) WHERE r.code = 'HR_MANAGER'
ON CONFLICT DO NOTHING;

-- HR_RECRUITER
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES
  ('company.profile.view'),('company.jobs.view_applicants'),('company.applications.update_status')
) AS c(code) WHERE r.code = 'HR_RECRUITER'
ON CONFLICT DO NOTHING;

-- HR_VIEWER
INSERT INTO rbac_role_permission (role_id, permission_code)
SELECT r.id, c.code FROM rbac_role r
CROSS JOIN (VALUES ('company.profile.view'),('company.jobs.view_applicants')) AS c(code)
WHERE r.code = 'HR_VIEWER'
ON CONFLICT DO NOTHING;
