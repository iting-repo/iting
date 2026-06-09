-- V133: Convert some ACTIVE jobs to PENDING for admin approval testing
-- Đổi một số job từ ACTIVE sang PENDING để test tính năng duyệt công việc

UPDATE job
SET status = 'PENDING'
WHERE id IN (1, 2, 3);
