-- ============================================================================
-- V112: Add CV Scoring Fields
-- Persists LLM-based CV quality score (0-100) and rubric breakdown per CV.
-- ============================================================================

ALTER TABLE CV
    ADD COLUMN IF NOT EXISTS overall_score     INTEGER,
    ADD COLUMN IF NOT EXISTS score_json        TEXT,
    ADD COLUMN IF NOT EXISTS scored_at         TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_cv_score ON CV(overall_score);
