-- Add hiring pipeline stage to Apply_form_user_to_job (composite key entity)
ALTER TABLE Apply_form_user_to_job
    ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(30) NOT NULL DEFAULT 'SCREENING',
    ADD COLUMN IF NOT EXISTS stage_updated_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS stage_updated_by BIGINT;

-- ApplicationStageHistory — track every move for audit + analytics
CREATE TABLE IF NOT EXISTS application_stage_history (
    id BIGSERIAL PRIMARY KEY,
    applyform_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    from_stage VARCHAR(30),
    to_stage VARCHAR(30) NOT NULL,
    note VARCHAR(500),
    moved_by BIGINT,
    moved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stage_history_application
    ON application_stage_history (applyform_id, job_id, moved_at DESC);

-- Email templates for HR (reusable subject + body, with placeholders {{candidate_name}}, {{job_title}})
CREATE TABLE IF NOT EXISTS hr_email_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT,                          -- NULL = system default
    name VARCHAR(150) NOT NULL,
    template_type VARCHAR(50) NOT NULL,         -- INTERVIEW_INVITE | OFFER | REJECT | THANK_YOU | CUSTOM
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hr_email_templates_company ON hr_email_templates (company_id, template_type);

-- Seed system-wide default templates
INSERT INTO hr_email_templates (company_id, name, template_type, subject, body, is_default) VALUES
(NULL, 'Mời phỏng vấn — mặc định', 'INTERVIEW_INVITE',
 '[{{company_name}}] Mời phỏng vấn vị trí {{job_title}}',
 'Chào {{candidate_name}},

Cảm ơn bạn đã ứng tuyển vị trí {{job_title}} tại {{company_name}}.

Chúng tôi xin trân trọng mời bạn tham gia buổi phỏng vấn:
• Thời gian: [HR điền cụ thể]
• Địa điểm: [HR điền cụ thể]
• Hình thức: [Online / Onsite]

Vui lòng phản hồi email này để xác nhận lịch hẹn.

Trân trọng,
{{hr_name}}
{{company_name}}',
 TRUE),

(NULL, 'Thông báo trúng tuyển — mặc định', 'OFFER',
 '[{{company_name}}] Thư mời nhận việc — vị trí {{job_title}}',
 'Chào {{candidate_name}},

Chúc mừng bạn đã được {{company_name}} chọn cho vị trí {{job_title}}!

Chi tiết offer:
• Vị trí: {{job_title}}
• Lương: [HR điền]
• Ngày bắt đầu: [HR điền]
• Probation: [HR điền]

Vui lòng phản hồi email này trong vòng 5 ngày làm việc.

Trân trọng,
{{hr_name}}
{{company_name}}',
 TRUE),

(NULL, 'Thông báo từ chối — mặc định', 'REJECT',
 '[{{company_name}}] Phản hồi đơn ứng tuyển vị trí {{job_title}}',
 'Chào {{candidate_name}},

Cảm ơn bạn đã quan tâm và ứng tuyển vị trí {{job_title}} tại {{company_name}}.

Sau khi xem xét hồ sơ, chúng tôi rất tiếc phải thông báo bạn chưa phù hợp với vị trí này ở thời điểm hiện tại.

Chúng tôi đánh giá cao thời gian bạn đã dành cho ITing và chúc bạn sớm tìm được công việc phù hợp.

Trân trọng,
{{hr_name}}
{{company_name}}',
 TRUE);
