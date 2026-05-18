-- V85: Thêm cột match_score vào bảng Apply_form_user_to_job
-- Lưu điểm phù hợp (%) giữa CV ứng viên và Job Description (cosine similarity * 100)
ALTER TABLE Apply_form_user_to_job
    ADD COLUMN IF NOT EXISTS match_score DOUBLE PRECISION;

-- Index để sort/filter theo match_score hiệu quả
CREATE INDEX IF NOT EXISTS idx_application_match_score
    ON Apply_form_user_to_job (job_id, match_score DESC NULLS LAST);
