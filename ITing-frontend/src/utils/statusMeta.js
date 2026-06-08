/**
 * NGUỒN CHUẨN DUY NHẤT cho badge trạng thái (nguyên lý đồng dạng — Similarity).
 *
 * Mọi màn hình map mã trạng thái → { variant, label } qua đây, rồi render bằng
 * component <Badge> chung. Nhờ vậy cùng một loại trạng thái luôn có CÙNG màu +
 * CÙNG nhãn ở mọi nơi → người dùng học 1 lần, đọc được khắp hệ thống.
 *
 * variant khớp với <Badge> (common/Badge.jsx):
 *   success = xanh lá · warning = vàng/cam · danger = đỏ · info = xanh dương ·
 *   default = xám · sky = tím · outline = viền.
 */

const fallback = (code) => ({ label: code || "Chưa cập nhật", variant: "default" });

// ── Trạng thái tin tuyển dụng (Job) ──
export const JOB_STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", variant: "success" },
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  REJECTED: { label: "Bị từ chối", variant: "danger" },
  CLOSED: { label: "Đã đóng", variant: "default" },
  EXPIRED: { label: "Hết hạn", variant: "danger" },
  NEEDS_REVISION: { label: "Cần chỉnh sửa", variant: "warning" },
  SUSPENDED: { label: "Bị đình chỉ", variant: "warning" },
};
export const getJobStatusMeta = (code) => JOB_STATUS_META[code] || fallback(code);

// ── Trạng thái công ty (Company) ──
export const COMPANY_STATUS_META = {
  PENDING_REVIEW: { label: "Chờ duyệt", variant: "warning" },
  UNDER_REVIEW: { label: "Đang xem xét", variant: "info" },
  APPROVED: { label: "Đã duyệt", variant: "success" },
  REJECTED: { label: "Bị từ chối", variant: "danger" },
  NEEDS_RESUBMISSION: { label: "Yêu cầu nộp lại", variant: "warning" },
  SUSPENDED: { label: "Bị đình chỉ", variant: "danger" },
  MISSING: { label: "Thiếu", variant: "default" },
  UPLOADED: { label: "Đã tải lên", variant: "info" },
};
export const getCompanyStatusMeta = (code) => COMPANY_STATUS_META[code] || fallback(code);

// ── Trạng thái người dùng (User account) ──
export const USER_STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", variant: "success" },
  INACTIVE: { label: "Chưa kích hoạt", variant: "default" },
  BANNED: { label: "Bị khóa", variant: "danger" },
  PENDING: { label: "Chờ duyệt", variant: "warning" },
};
export const getUserStatusMeta = (code) => USER_STATUS_META[code] || fallback(code);

// ── Trạng thái xử lý báo cáo vi phạm (Report) ──
export const REPORT_STATUS_META = {
  PENDING: { label: "Chờ xử lý", variant: "warning" },
  REVIEWING: { label: "Đang xem xét", variant: "info" },
  RESOLVED: { label: "Đã xử lý", variant: "success" },
  DISMISSED: { label: "Bác bỏ", variant: "danger" },
};
export const getReportStatusMeta = (code) => REPORT_STATUS_META[code] || fallback(code);
