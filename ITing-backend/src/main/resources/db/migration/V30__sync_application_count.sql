-- Sync application_count with actual count from apply_form_user_to_job table
-- Table names are singular and lowercase in database: 'job' and 'apply_form_user_to_job'

UPDATE job j
SET application_count = sub.cnt
FROM (
    SELECT afs.job_id, COUNT(*) as cnt
    FROM apply_form_user_to_job afs
    GROUP BY afs.job_id
) sub
WHERE j.id = sub.job_id;

-- Set 0 for jobs without any applications (in case they have NULL)
UPDATE job
SET application_count = 0
WHERE application_count IS NULL;
