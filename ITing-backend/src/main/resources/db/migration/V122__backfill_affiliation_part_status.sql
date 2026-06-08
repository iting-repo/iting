-- Sửa các đơn affiliation đã nộp (submission_status = PENDING_REVIEW) trước khi luồng nộp-cả-gói
-- khởi tạo trạng thái từng phần: 3 phần vẫn 'NONE' nên admin thấy "Chưa gửi" và không duyệt được.
-- Đưa các phần chưa khởi tạo về PENDING_REVIEW để admin duyệt từng phần.
UPDATE company_hr_affiliations
SET info_status    = CASE WHEN info_status    = 'NONE' THEN 'PENDING_REVIEW' ELSE info_status    END,
    license_status = CASE WHEN license_status = 'NONE' THEN 'PENDING_REVIEW' ELSE license_status END,
    consent_status = CASE WHEN consent_status = 'NONE' THEN 'PENDING_REVIEW' ELSE consent_status END
WHERE submission_status = 'PENDING_REVIEW';
