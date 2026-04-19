-- Sync notification sequence to prevent duplicate key errors
-- Key (id)=(4) already exists means sequence is out of sync with hardcoded data in V2

SELECT setval(pg_get_serial_sequence('notification', 'id'), (SELECT MAX(id) FROM notification));
