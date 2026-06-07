-- V117: Gán company role (RBAC scope=COMPANY) cho từng HR thuộc một công ty.
-- Mỗi CompanyHrAffiliation (1 HR ↔ 1 Company) mang thêm company_role_code tham chiếu rbac_role.code
-- (SUPER_HR / HR_MANAGER / HR_RECRUITER / HR_VIEWER). NULL = chưa gán vai trò.
ALTER TABLE company_hr_affiliations
    ADD COLUMN IF NOT EXISTS company_role_code VARCHAR(60);

-- HR đại diện (info source của công ty) mặc định là SUPER_HR nếu đang APPROVED.
UPDATE company_hr_affiliations a
SET company_role_code = 'SUPER_HR'
FROM company c
WHERE a.company_id = c.company_id
  AND c.info_source_affiliation_id = a.id
  AND a.status = 'APPROVED'
  AND a.company_role_code IS NULL;
