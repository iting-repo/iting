-- Fix invalid WorkingDays values inserted by V46 before it was corrected
-- Also cleanup any other invalid enum values

-- Fix WorkingDays: convert any non-enum values to valid ones
UPDATE job SET working_days = 'MON_TO_FRI' WHERE working_days IS NOT NULL AND (
    LOWER(working_days) LIKE '%thứ 2%thứ 6%'
    OR LOWER(working_days) LIKE '%thứ 2 - thứ 4%'
    OR LOWER(working_days) LIKE '%08:30%'
    OR LOWER(working_days) LIKE '%09:00%'
    OR LOWER(working_days) LIKE '%sáng%'
);

UPDATE job SET working_days = 'FLEXIBLE' WHERE working_days IS NOT NULL
    AND working_days NOT IN ('MON_TO_FRI', 'MON_TO_SAT', 'FLEXIBLE');
