-- V29__add_job_ai_review_fields.sql
ALTER TABLE "job" ADD COLUMN ai_review_status VARCHAR(50);
ALTER TABLE "job" ADD COLUMN ai_review_reason TEXT;
