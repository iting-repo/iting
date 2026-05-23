-- ============================================================
-- V102: Normalize company logo URLs trỏ vào file có thật trong
-- ITing-frontend/public/ (đã được Dockerfile copy sang nginx html
-- từ v1.0.39).
--
-- Trước đây prod có path tạm như '/grab.jpg', '/fsft.png' không
-- có file → 404 ở console. Sửa về tên file thực tế.
-- ============================================================

UPDATE company SET logo = '/fsoft-logo.jpg'   WHERE company_id = 11; -- FPT Software
UPDATE company SET logo = '/vng-logo.png'     WHERE company_id = 12; -- VNG Corporation
UPDATE company SET logo = '/vin-ai.jpg'       WHERE company_id = 13; -- VinGroup
UPDATE company SET logo = '/tiki-logo.jpg'    WHERE company_id = 14; -- Tiki Corporation
UPDATE company SET logo = '/shopee-logo.jpg'  WHERE company_id = 15; -- Shopee Vietnam
UPDATE company SET logo = '/viettle-logo.jpg' WHERE company_id = 21; -- Viettel Digital
UPDATE company SET logo = '/momo-logo.png'    WHERE company_id = 22; -- MoMo (M-Service)
UPDATE company SET logo = '/grab-logo.png'    WHERE company_id = 23; -- Grab Vietnam
