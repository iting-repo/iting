UPDATE job
SET application_count = (
    SELECT COUNT(*)
    FROM apply_form_user_to_job
    WHERE apply_form_user_to_job.job_id = job.id
);
