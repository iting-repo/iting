-- Migrate old free-text workingDays values to new enum values
UPDATE job SET working_days = 'MON_TO_FRI' WHERE working_days IS NOT NULL AND (
    LOWER(working_days) LIKE '%thứ 2%thứ 6%'
    OR LOWER(working_days) LIKE '%t2%t6%'
    OR LOWER(working_days) LIKE '%thứ hai%thứ sáu%'
    OR LOWER(working_days) LIKE '%monday%friday%'
    OR working_days = 'thứ 2 - thứ 6'
);

UPDATE job SET working_days = 'MON_TO_SAT' WHERE working_days IS NOT NULL AND (
    LOWER(working_days) LIKE '%thứ 2%thứ 7%'
    OR LOWER(working_days) LIKE '%t2%t7%'
    OR LOWER(working_days) LIKE '%thứ hai%thứ bảy%'
    OR LOWER(working_days) LIKE '%monday%saturday%'
);

-- Any remaining non-enum values become FLEXIBLE
UPDATE job SET working_days = 'FLEXIBLE' WHERE working_days IS NOT NULL
    AND working_days NOT IN ('MON_TO_FRI', 'MON_TO_SAT', 'FLEXIBLE');
