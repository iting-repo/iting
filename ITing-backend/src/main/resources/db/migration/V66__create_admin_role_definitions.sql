-- Bảng định nghĩa vai trò admin (dynamic roles)
CREATE TABLE admin_role_definitions (
    id          BIGSERIAL PRIMARY KEY,
    role_key    VARCHAR(50) NOT NULL UNIQUE,
    label       VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    icon        VARCHAR(10) DEFAULT '👁️',
    color       VARCHAR(20) DEFAULT '#6B7280',
    bg_light    VARCHAR(30) DEFAULT 'bg-gray-50',
    level       INTEGER NOT NULL DEFAULT 25,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_role_def_key ON admin_role_definitions(role_key);
CREATE INDEX idx_admin_role_def_level ON admin_role_definitions(level);

-- Seed 4 vai trò mặc định (system roles, không xóa được)
INSERT INTO admin_role_definitions (role_key, label, description, icon, color, bg_light, level, is_system) VALUES
('SUPER_ADMIN', 'Super Admin',      'Toàn quyền hệ thống, quản lý admin khác', '👑', '#EF4444', 'bg-red-50',    100, TRUE),
('ADMIN',       'Quản trị viên',    'Quản lý user, company, jobs, CMS',         '🛡️', '#F59E0B', 'bg-amber-50',  75,  TRUE),
('MODERATOR',   'Kiểm duyệt viên', 'Kiểm duyệt nội dung, xử lý báo cáo',     '🔍', '#3B82F6', 'bg-blue-50',   50,  TRUE),
('VIEWER',      'Xem',             'Chỉ xem, không chỉnh sửa',                '👁️', '#6B7280', 'bg-gray-50',   25,  TRUE);
