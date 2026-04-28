-- ============================================================================
-- V14: Rename tech_required to skills in Job table
--       Drop level column from Skill table
-- ============================================================================

-- Job: rename column tech_required -> skills
ALTER TABLE Job RENAME COLUMN tech_required TO skills;

-- Skill: drop level column (candidates will only pick skill names)
ALTER TABLE Skill DROP COLUMN IF EXISTS level;
