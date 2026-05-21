-- =====================================================================
-- V92: Seed founded_year cho các công ty lớn.
-- Trang chi tiết công ty đã hiển thị "NĂM THÀNH LẬP" nhưng dữ liệu trống.
-- =====================================================================

UPDATE postgres.company SET founded_year = 1999 WHERE company_id = 11; -- FPT Software (1999)
UPDATE postgres.company SET founded_year = 2004 WHERE company_id = 12; -- VNG Corporation (2004)
UPDATE postgres.company SET founded_year = 1993 WHERE company_id = 13; -- VinGroup (1993, gốc Technocom Ukraine)
UPDATE postgres.company SET founded_year = 2010 WHERE company_id = 14; -- Tiki Corporation (2010)
UPDATE postgres.company SET founded_year = 2015 WHERE company_id = 15; -- Shopee Vietnam (2015 tại VN)
UPDATE postgres.company SET founded_year = 2019 WHERE company_id = 21; -- Viettel Digital (2019)
UPDATE postgres.company SET founded_year = 2007 WHERE company_id = 22; -- MoMo M-Service (2007)
UPDATE postgres.company SET founded_year = 2014 WHERE company_id = 23; -- Grab Vietnam (2014 tại VN; Grab Malaysia 2012)
