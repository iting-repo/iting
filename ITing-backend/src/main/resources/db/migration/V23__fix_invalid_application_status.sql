-- Clean up any invalid enum strings in the database left from previous buggy iterations or manual tests
UPDATE Apply_form_user_to_job SET status = 'VIEWED' WHERE status = 'REVIEWED';
UPDATE Apply_form_user_to_job SET status = 'ACCEPTED' WHERE status = 'INTERVIEW';
