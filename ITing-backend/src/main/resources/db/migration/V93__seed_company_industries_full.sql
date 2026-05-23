-- =====================================================================
-- V93: Seed industries (multi-tag) cho 8 công ty lớn — đồng nhất hoàn toàn.
-- Trang chi tiết công ty hiển thị "LĨNH VỰC CHÍNH" từ bảng company_industries.
-- DELETE + INSERT để idempotent (rerun không trùng).
--
-- Industry enum values (từ Industry.java):
--   SOFTWARE_DEVELOPMENT, WEB_DEVELOPMENT, MOBILE_DEVELOPMENT,
--   CLOUD_COMPUTING, DEVOPS, DATA_SCIENCE,
--   AI, CYBERSECURITY, BLOCKCHAIN,
--   GAME_DEVELOPMENT, QA_TESTING, IT_SOFTWARE
-- =====================================================================

DELETE FROM company_industries WHERE company_id IN (11, 12, 13, 14, 15, 21, 22, 23);

-- FPT Software (11) — IT outsourcing & dịch vụ phần mềm toàn cầu
INSERT INTO company_industries (company_id, industry) VALUES
    (11, 'SOFTWARE_DEVELOPMENT'),
    (11, 'CLOUD_COMPUTING'),
    (11, 'AI'),
    (11, 'DEVOPS'),
    (11, 'QA_TESTING'),
    (11, 'IT_SOFTWARE');

-- VNG Corporation (12) — Game + Zalo + Cloud
INSERT INTO company_industries (company_id, industry) VALUES
    (12, 'GAME_DEVELOPMENT'),
    (12, 'MOBILE_DEVELOPMENT'),
    (12, 'WEB_DEVELOPMENT'),
    (12, 'CLOUD_COMPUTING'),
    (12, 'AI'),
    (12, 'SOFTWARE_DEVELOPMENT');

-- VinGroup (13) — Tập đoàn đa ngành + VinAI + VinBigData
INSERT INTO company_industries (company_id, industry) VALUES
    (13, 'SOFTWARE_DEVELOPMENT'),
    (13, 'AI'),
    (13, 'DATA_SCIENCE'),
    (13, 'MOBILE_DEVELOPMENT'),
    (13, 'IT_SOFTWARE');

-- Tiki Corporation (14) — Sàn TMĐT VN
INSERT INTO company_industries (company_id, industry) VALUES
    (14, 'WEB_DEVELOPMENT'),
    (14, 'MOBILE_DEVELOPMENT'),
    (14, 'DATA_SCIENCE'),
    (14, 'AI'),
    (14, 'SOFTWARE_DEVELOPMENT'),
    (14, 'CLOUD_COMPUTING');

-- Shopee Vietnam (15) — Sàn TMĐT khu vực
INSERT INTO company_industries (company_id, industry) VALUES
    (15, 'MOBILE_DEVELOPMENT'),
    (15, 'WEB_DEVELOPMENT'),
    (15, 'SOFTWARE_DEVELOPMENT'),
    (15, 'CLOUD_COMPUTING'),
    (15, 'DATA_SCIENCE'),
    (15, 'AI');

-- Viettel Digital (21) — FinTech + Smart City + AI quân đội
INSERT INTO company_industries (company_id, industry) VALUES
    (21, 'SOFTWARE_DEVELOPMENT'),
    (21, 'CLOUD_COMPUTING'),
    (21, 'AI'),
    (21, 'CYBERSECURITY'),
    (21, 'MOBILE_DEVELOPMENT'),
    (21, 'IT_SOFTWARE');

-- MoMo M-Service (22) — Ví điện tử FinTech
INSERT INTO company_industries (company_id, industry) VALUES
    (22, 'MOBILE_DEVELOPMENT'),
    (22, 'SOFTWARE_DEVELOPMENT'),
    (22, 'DATA_SCIENCE'),
    (22, 'AI'),
    (22, 'CYBERSECURITY'),
    (22, 'IT_SOFTWARE');

-- Grab Vietnam (23) — Super-app gọi xe + giao hàng + thanh toán
INSERT INTO company_industries (company_id, industry) VALUES
    (23, 'MOBILE_DEVELOPMENT'),
    (23, 'SOFTWARE_DEVELOPMENT'),
    (23, 'DATA_SCIENCE'),
    (23, 'AI'),
    (23, 'CLOUD_COMPUTING'),
    (23, 'DEVOPS');
