-- ============================================================================
-- V94: Notification Preferences
-- Lưu cài đặt thông báo per-user (1-1 với account).
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                  BIGINT       PRIMARY KEY,

    -- Notification categories
    job_alerts          BOOLEAN      NOT NULL DEFAULT TRUE,
    application_updates BOOLEAN      NOT NULL DEFAULT TRUE,
    new_messages        BOOLEAN      NOT NULL DEFAULT TRUE,
    recommendations     BOOLEAN      NOT NULL DEFAULT TRUE,
    system_updates      BOOLEAN      NOT NULL DEFAULT FALSE,
    promotions          BOOLEAN      NOT NULL DEFAULT FALSE,
    weekly_digest       BOOLEAN      NOT NULL DEFAULT TRUE,
    followed_companies  BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Delivery channels
    email_enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    push_enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    sms_enabled         BOOLEAN      NOT NULL DEFAULT FALSE,
    sound_enabled       BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Quiet hours
    quiet_hours_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    quiet_hours_from    TIME         NOT NULL DEFAULT '22:00',
    quiet_hours_to      TIME         NOT NULL DEFAULT '07:00',

    -- Audit
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notif_pref_account FOREIGN KEY (id) REFERENCES account(id) ON DELETE CASCADE
);
