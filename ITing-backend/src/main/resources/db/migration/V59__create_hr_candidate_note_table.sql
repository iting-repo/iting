-- Bảng ghi chú cá nhân của từng HR cho mỗi đơn ứng tuyển.
-- Mỗi HR chỉ xem/sửa được ghi chú của chính mình — không chia sẻ với HR khác cùng công ty.
CREATE TABLE IF NOT EXISTS hr_candidate_note (
    id              BIGSERIAL PRIMARY KEY,
    hr_account_id   BIGINT NOT NULL,
    application_id  BIGINT NOT NULL,
    note_content    TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_hr_candidate_note UNIQUE (hr_account_id, application_id)
);

CREATE INDEX IF NOT EXISTS idx_hr_candidate_note_hr ON hr_candidate_note(hr_account_id);
CREATE INDEX IF NOT EXISTS idx_hr_candidate_note_app ON hr_candidate_note(application_id);
