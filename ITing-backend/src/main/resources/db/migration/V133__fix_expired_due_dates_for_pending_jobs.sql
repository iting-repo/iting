-- V133: Bù hạn nộp hồ sơ cho các tin PENDING đã quá hạn để admin có thể duyệt
-- Các tin đang chờ duyệt (PENDING) nhưng due_date đã ở quá khứ sẽ không thể duyệt được
-- (nghiệp vụ chặn duyệt tin quá hạn). Đẩy hạn các tin này về tương lai (+90 ngày kể từ hôm nay)
-- để khôi phục khả năng duyệt. Không đụng tới các tin ACTIVE đang hiển thị cho ứng viên.

UPDATE job
SET due_date = CURRENT_DATE + INTERVAL '90 days'
WHERE status = 'PENDING'
  AND due_date IS NOT NULL
  AND due_date < CURRENT_DATE;
