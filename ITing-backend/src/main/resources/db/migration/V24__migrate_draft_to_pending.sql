-- Update all jobs with status 'DRAFT' to 'PENDING' because 'DRAFT' has been removed from JobStatus enum
UPDATE Job SET status = 'PENDING' WHERE status = 'DRAFT';
