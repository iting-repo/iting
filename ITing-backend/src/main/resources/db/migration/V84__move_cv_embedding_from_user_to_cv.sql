-- =====================================================================
-- V84: Move cv_embedding from candidate_info → CV.
--
-- Lý do: 1 candidate có thể có nhiều CV, mỗi CV nên có embedding riêng.
-- Trước V84: candidate_info.cv_embedding (1 embedding / user).
-- Sau V84:   CV.cv_embedding (1 embedding / CV) + embedding_updated_at.
--
-- Backfill: copy embedding của candidate_info → CV `is_default = true` của user đó.
-- Nếu user không có CV default → bỏ qua (data sẽ được pipeline embed lại khi CV mới
-- được upload).
-- =====================================================================

-- ───────────── Thêm cột mới vào CV ─────────────
ALTER TABLE cv
    ADD COLUMN IF NOT EXISTS cv_embedding         TEXT,
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP;

-- ───────────── Backfill từ candidate_info ─────────────
-- Chỉ áp dụng khi candidate_info.cv_embedding còn tồn tại (defensive).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name = 'candidate_info' AND column_name = 'cv_embedding'
    ) THEN
        -- Cập nhật CV default của mỗi user bằng embedding cũ của user đó.
        EXECUTE $sql$
            UPDATE cv c
               SET cv_embedding = ci.cv_embedding,
                   embedding_updated_at = NOW()
              FROM candidate_info ci
             WHERE c.profile_id = ci.id
               AND c.is_default = TRUE
               AND c.cv_embedding IS NULL
               AND ci.cv_embedding IS NOT NULL
        $sql$;

        -- Fallback: với user không có CV default nhưng có CV bất kỳ → gán vào CV
        -- mới nhất (chỉ khi CV đó chưa có embedding).
        EXECUTE $sql$
            UPDATE cv c
               SET cv_embedding = ci.cv_embedding,
                   embedding_updated_at = NOW()
              FROM candidate_info ci
             WHERE c.profile_id = ci.id
               AND c.cv_embedding IS NULL
               AND ci.cv_embedding IS NOT NULL
               AND c.id = (
                   SELECT MAX(c2.id) FROM cv c2 WHERE c2.profile_id = ci.id
               )
        $sql$;
    END IF;
END $$;

-- ───────────── Drop cột cũ trên candidate_info ─────────────
ALTER TABLE candidate_info
    DROP COLUMN IF EXISTS cv_embedding;

-- ───────────── Index hỗ trợ truy vấn embedding ─────────────
CREATE INDEX IF NOT EXISTS idx_cv_profile_default ON cv(profile_id, is_default DESC, upload_time DESC);
