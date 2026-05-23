-- ============================================================================
-- V96: System Announcements
-- Admin tạo thông báo modal/banner hiển thị cho user theo route + role + thời gian.
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_announcements (
    id                  BIGSERIAL PRIMARY KEY,

    title               VARCHAR(255)   NOT NULL,
    body_html           TEXT,
    image_url           VARCHAR(1000),

    -- MODAL_BLOCKING (buộc accept) / MODAL_DISMISSIBLE (đóng được) / BANNER (thanh trên đầu)
    display_mode        VARCHAR(30)    NOT NULL DEFAULT 'MODAL_DISMISSIBLE',

    -- Khi require_acknowledge = true → user phải tick checkbox & nhấn Accept mới đóng được
    require_acknowledge BOOLEAN        NOT NULL DEFAULT FALSE,

    -- Target role: ALL / CANDIDATE / EMPLOYER / ADMIN — comma-separated string
    target_roles        VARCHAR(100)   NOT NULL DEFAULT 'ALL',

    -- Trigger routes: JSON array các glob pattern. VD: ["/", "/jobs/*"]
    -- Đặc biệt: "LOGIN" = chỉ hiện sau khi vừa login lần đầu trong session
    trigger_routes      TEXT           NOT NULL DEFAULT '["/"]',

    start_at            TIMESTAMP,
    end_at              TIMESTAMP,

    -- Khi nhiều announcement active cùng lúc, cái priority cao hơn được show
    priority            INTEGER        NOT NULL DEFAULT 0,

    active              BOOLEAN        NOT NULL DEFAULT TRUE,

    created_by          BIGINT,
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON system_announcements(active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON system_announcements(priority DESC);

-- Bảng tracking user đã ack announcement nào → không show lại nữa
CREATE TABLE IF NOT EXISTS announcement_acks (
    user_id         BIGINT     NOT NULL,
    announcement_id BIGINT     NOT NULL,
    acked_at        TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, announcement_id),
    CONSTRAINT fk_ack_user FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
    CONSTRAINT fk_ack_announcement FOREIGN KEY (announcement_id) REFERENCES system_announcements(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ack_user ON announcement_acks(user_id);
