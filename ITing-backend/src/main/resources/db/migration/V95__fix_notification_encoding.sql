-- V95: Fix thong bao bi mat dau tieng Viet (encoding issue tren Windows)
-- Xoa cac thong bao cu bi mat dau de thong bao moi se dung dau

-- Xoa thong bao follow bi loi encoding (khong co dau tieng Viet)
DELETE FROM notification
WHERE content LIKE 'Ban da theo doi cong ty%';

-- Xoa toan bo thong bao co noi dung khong dau tieng Viet (tuy chon)
-- Uncomment dong duoi neu muon xoa tat ca thong bao cu bi loi
-- DELETE FROM notification WHERE content ~ '^[A-Za-z0-9 .,!?:;''"()\-]+$' AND LENGTH(content) > 10;
