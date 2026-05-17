-- Cleanup spam notifications: remove duplicate "Công việc đang chờ duyệt" notifications
-- Keep only the MOST RECENT one per recipient
DELETE FROM notification
WHERE id NOT IN (
    SELECT keep_id FROM (
        SELECT MAX(id) AS keep_id
        FROM notification
        WHERE content LIKE 'Công việc đang chờ duyệt:%'
        GROUP BY recipient_id
    ) AS keeper
)
AND content LIKE 'Công việc đang chờ duyệt:%';
