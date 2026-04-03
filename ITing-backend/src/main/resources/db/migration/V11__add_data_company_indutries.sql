
INSERT INTO company_industries (company_id, industry) VALUES
-- FPT Software (11)
(11, 'SOFTWARE_DEVELOPMENT'),
(11, 'CLOUD_COMPUTING'),
(11, 'AI'),
(11, 'QA_TESTING'),

-- VNG Corporation (12)
(12, 'GAME_DEVELOPMENT'),
(12, 'MOBILE_DEVELOPMENT'),
(12, 'WEB_DEVELOPMENT'),
(12, 'CLOUD_COMPUTING'),

-- VinGroup (13)
(13, 'AI'),
(13, 'DATA_SCIENCE'),
(13, 'SOFTWARE_DEVELOPMENT'),

-- Tiki Corporation (14)
(14, 'WEB_DEVELOPMENT'),
(14, 'MOBILE_DEVELOPMENT'),
(14, 'DATA_SCIENCE'),

-- Shopee Vietnam (15)
(15, 'SOFTWARE_DEVELOPMENT'),
(15, 'WEB_DEVELOPMENT'),
(15, 'MOBILE_DEVELOPMENT');

-- Optional: If you want to migrate existing data from Company.Industry to company_industries (commented out as sample data is added above)
-- INSERT INTO company_industries (company_id, industry)
-- SELECT company_id, Industry FROM Company WHERE Industry IS NOT NULL AND Industry <> ''
-- ON CONFLICT DO NOTHING;

-- Optional: Drop the old column if no longer needed
-- ALTER TABLE Company DROP COLUMN Industry;
