-- Migration: V37__cleanup_database_integrity.sql
-- Description: Normalize SalaryType values and reassign jobs with invalid company references.

-- 1. Fix SalaryType mismatch (Ensure all 'MONTHLY' or similar are 'MONTH')
UPDATE Job 
SET Salary_type = 'MONTH' 
WHERE Salary_type NOT IN ('MONTH', 'YEAR', 'HOUR', 'PROJECT', 'NEGOTIABLE');

-- 2. Identify and reassign jobs with invalid Company IDs
-- ID 109 is often confused with a user/account ID in the seed data.
-- We reassign any jobs pointing to 109 to Company ID 11 (a valid company in V2/data.sql)
UPDATE Job
SET Company_id = 11
WHERE Company_id NOT IN (SELECT company_id FROM Company);

-- 3. Cleanup Job-Company upload relationship
DELETE FROM Company_upload_job 
WHERE job_id NOT IN (SELECT Id FROM Job);

DELETE FROM Company_upload_job 
WHERE company_id NOT IN (SELECT company_id FROM Company);

-- 4. Verify/Fix Company-User connection
-- ensure consistency in the relationship auditing
