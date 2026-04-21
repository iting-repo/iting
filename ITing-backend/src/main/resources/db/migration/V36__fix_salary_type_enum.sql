-- ============================================================================
-- ITing Job Portal - V36 Fix SalaryType Enum values
-- ============================================================================

-- Update any existing records that might have 'MONTHLY' to 'MONTH'
UPDATE Job SET Salary_type = 'MONTH' WHERE Salary_type = 'MONTHLY';
