-- Thêm cột risk_level cho audit log (LOW | MEDIUM | HIGH | CRITICAL).
-- Được tính tự động lúc ghi log (AdminAuditAspect) từ action/entityType/URI.
ALTER TABLE activity_logs
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_activity_logs_risk_level ON activity_logs(risk_level);
