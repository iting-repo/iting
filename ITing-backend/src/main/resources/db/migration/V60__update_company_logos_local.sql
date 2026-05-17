-- Cập nhật logo công ty sang ảnh local (public folder frontend)
-- Frontend serve static files từ /public, nên path là /<filename>

UPDATE company SET logo = '/fsft.png'      WHERE company_id = 11;   -- FPT Software
UPDATE company SET logo = '/vng.jpg'       WHERE company_id = 12;   -- VNG Corporation
UPDATE company SET logo = '/vin-ai.jpg'    WHERE company_id = 13;   -- VinGroup
UPDATE company SET logo = '/viettle.jpg'   WHERE company_id = 21;   -- Viettel Digital
UPDATE company SET logo = '/grab.jpg'      WHERE company_id = 23;   -- Grab Vietnam
