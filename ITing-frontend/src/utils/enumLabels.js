// Mapping toàn bộ enum của backend sang nhãn tiếng Việt để hiển thị FE.
// Mỗi map được export riêng + có hàm helper `labelOf(...)` an toàn cho null/unknown value.

// ========== JOB ==========

export const JOB_STATUS_LABELS = {
    PENDING: 'Chờ duyệt',
    ACTIVE: 'Đang tuyển',
    EXPIRED: 'Hết hạn',
    CLOSED: 'Đã đóng',
    REJECTED: 'Bị từ chối',
    SUSPENDED: 'Tạm khóa',
};

export const JOB_TYPE_LABELS = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    CONTRACT: 'Hợp đồng',
    INTERNSHIP: 'Thực tập',
    REMOTE: 'Làm việc từ xa',
    FREELANCE: 'Tự do',
};

export const EXPERIENCE_LEVEL_LABELS = {
    INTERN: 'Thực tập sinh',
    FRESHER: 'Mới ra trường',
    JUNIOR: 'Junior (1-2 năm)',
    MIDDLE: 'Middle (2-4 năm)',
    MID_LEVEL: 'Mid-level (2-4 năm)',
    SENIOR: 'Senior (4-7 năm)',
    LEAD: 'Lead (7+ năm)',
    EXPERT: 'Chuyên gia',
    MANAGER: 'Quản lý',
};

export const SALARY_TYPE_LABELS = {
    MONTH: 'Theo tháng',
    YEAR: 'Theo năm',
    HOUR: 'Theo giờ',
    PROJECT: 'Theo dự án',
    NEGOTIABLE: 'Thỏa thuận',
};

export const WORKING_DAYS_LABELS = {
    MON_TO_FRI: 'Thứ 2 - Thứ 6',
    MON_TO_SAT: 'Thứ 2 - Thứ 7',
    FLEXIBLE: 'Linh hoạt',
};

export const JOB_REVIEW_ACTION_LABELS = {
    CREATED: 'Tạo mới',
    SUBMITTED: 'Đã gửi duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
    REQUEST_REVISION: 'Yêu cầu chỉnh sửa',
    SUSPENDED: 'Tạm khóa',
    UPDATED: 'Đã cập nhật',
};

// ========== APPLICATION ==========

export const APPLICATION_STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    VIEWED: 'Đã xem',
    ACCEPTED: 'Được chấp nhận',
    REJECTED: 'Bị từ chối',
    WITHDRAWN: 'Đã rút đơn',
};

// ========== AUTH / ACCOUNT ==========

export const ACCOUNT_STATUS_LABELS = {
    ACTIVE: 'Đang hoạt động',
    PENDING: 'Chờ kích hoạt',
    BANNED: 'Đã bị cấm',
    INACTIVE: 'Ngừng hoạt động',
    SUSPENDED: 'Tạm khóa',
};

export const ROLE_LABELS = {
    CANDIDATE: 'Ứng viên',
    USER: 'Ứng viên',
    EMPLOYER: 'Nhà tuyển dụng',
    COMPANY: 'Nhà tuyển dụng',
    ADMIN: 'Quản trị viên',
};

// ========== COMPANY ==========

export const COMPANY_REVIEW_STATUS_LABELS = {
    DRAFT: 'Bản nháp',
    PENDING_REVIEW: 'Chờ duyệt',
    UNDER_REVIEW: 'Đang xét duyệt',
    NEEDS_RESUBMISSION: 'Cần gửi lại',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
    SUSPENDED: 'Tạm khóa',
};

export const DOCUMENT_REVIEW_STATUS_LABELS = {
    MISSING: 'Chưa có',
    UPLOADED: 'Đã tải lên',
    PENDING_REVIEW: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
};

export const VERIFICATION_LEVEL_LABELS = {
    UNVERIFIED: 'Chưa xác thực',
    BASIC: 'Xác thực cơ bản',
    ADVANCED: 'Xác thực nâng cao',
    PREMIUM: 'Đối tác chiến lược',
};

export const INDUSTRY_LABELS = {
    SOFTWARE_DEVELOPMENT: 'Phát triển phần mềm',
    WEB_DEVELOPMENT: 'Phát triển Web',
    MOBILE_DEVELOPMENT: 'Phát triển Mobile',
    CLOUD_COMPUTING: 'Điện toán đám mây',
    DEVOPS: 'DevOps',
    DATA_SCIENCE: 'Khoa học dữ liệu',
    AI: 'Trí tuệ nhân tạo',
    CYBERSECURITY: 'An ninh mạng',
    BLOCKCHAIN: 'Blockchain',
    GAME_DEVELOPMENT: 'Phát triển Game',
    QA_TESTING: 'Kiểm thử (QA)',
    IT_SOFTWARE: 'Phần mềm & CNTT',
};

export const AFFILIATION_STATUS_LABELS = {
    INCOMPLETE: 'Chưa hoàn thiện',
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
    REVOKED: 'Đã thu hồi',
};

export const SUBMISSION_STATUS_LABELS = {
    NONE: 'Chưa gửi',
    DRAFT: 'Bản nháp',
    PENDING_REVIEW: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
};

export const BUSINESS_DOCUMENT_TYPE_LABELS = {
    BUSINESS_LICENSE: 'Giấy đăng ký doanh nghiệp',
    EQUIVALENT_DOCUMENT: 'Giấy tờ tương đương',
    AUTHORIZATION_AND_ID: 'Giấy ủy quyền & định danh',
};

export const COMPANY_AUDIT_ACTION_LABELS = {
    APPROVE: 'Duyệt',
    REJECT: 'Từ chối',
    SUSPEND: 'Tạm khóa',
    UNSUSPEND: 'Mở khóa',
    REQUEST_RESUBMISSION: 'Yêu cầu gửi lại',
    DELETE: 'Xóa',
};

// ========== NOTIFICATION ==========

export const NOTIFICATION_TYPE_LABELS = {
    JOB_NEW: 'Tin tuyển dụng mới',
    JOB_MATCH: 'Việc làm phù hợp',
    JOB_EXPIRING_SOON: 'Tin sắp hết hạn',
    JOB_EXPIRED: 'Tin đã hết hạn',
    APPLICATION_VIEWED: 'NTD đã xem hồ sơ',
    APPLICATION_ACCEPTED: 'Hồ sơ được chấp nhận',
    APPLICATION_REJECTED: 'Hồ sơ bị từ chối',
    APPLICATION_STATUS_CHANGED: 'Trạng thái đơn ứng tuyển đã thay đổi',
    COMPANY_UPDATE: 'Công ty cập nhật thông tin',
    COMPANY_NEW_JOB: 'Công ty bạn theo dõi đăng tin mới',
    COMPANY_NEW_FOLLOWER: 'Có người theo dõi công ty',
    MESSAGE_NEW: 'Tin nhắn mới',
    SYSTEM_ANNOUNCEMENT: 'Thông báo hệ thống',
    ACCOUNT_UPDATE: 'Cập nhật tài khoản',
    COMPANY_SUSPENDED: 'Công ty bị tạm khóa',
    COMPANY_UNSUSPENDED: 'Công ty được mở khóa',
    SYSTEM: 'Hệ thống',
    ADMIN_COMPANY_REGISTERED: 'Công ty mới đăng ký',
    ADMIN_JOB_CREATED: 'Tin tuyển dụng mới (admin)',
    ADMIN_REPORT_RECEIVED: 'Có báo cáo mới',
};

export const RECIPIENT_TYPE_LABELS = {
    USER: 'Ứng viên',
    COMPANY: 'Nhà tuyển dụng',
    ADMIN: 'Quản trị viên',
};

// ========== ADMIN / REPORT ==========

export const REPORT_STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    RESOLVED: 'Đã xử lý',
    REJECTED: 'Bị từ chối',
};

export const REPORT_TYPE_LABELS = {
    POST: 'Bài đăng',
    JOB: 'Tin tuyển dụng',
    COMMENT: 'Bình luận',
    ACCOUNT: 'Tài khoản',
};

export const SEVERITY_LEVEL_LABELS = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    CRITICAL: 'Nghiêm trọng',
};

// ========== USER ==========

export const GENDER_LABELS = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
};

// ========== USER PROFILE ==========

export const EDUCATION_LEVEL_LABELS = {
    HIGH_SCHOOL: 'Trung học phổ thông',
    ASSOCIATE: 'Cao đẳng',
    BACHELOR: 'Đại học',
    MASTER: 'Thạc sĩ',
    DOCTORATE: 'Tiến sĩ',
    OTHER: 'Khác',
};

export const EMPLOYMENT_STATUS_LABELS = {
    ACTIVELY_LOOKING: 'Đang tìm việc tích cực',
    OPEN_TO_OPPORTUNITIES: 'Sẵn sàng cơ hội mới',
    NOT_LOOKING: 'Chưa có nhu cầu',
    FREELANCE_AVAILABLE: 'Sẵn sàng nhận freelance',
};

export const CV_STATUS_LABELS = {
    UPLOADED: 'Đã tải lên',
    PROCESSING: 'Đang xử lý',
    ACTIVE: 'Đang sử dụng',
    INACTIVE: 'Không hoạt động',
    FAILED: 'Lỗi',
};

export const SOCIAL_PLATFORM_LABELS = {
    LINKEDIN: 'LinkedIn',
    GITHUB: 'GitHub',
    PORTFOLIO: 'Portfolio',
    TWITTER: 'Twitter',
};

// ========== MESSAGING ==========

export const CONVERSATION_TYPE_LABELS = {
    USER_USER: 'Ứng viên - Ứng viên',
    USER_COMPANY: 'Ứng viên - Nhà tuyển dụng',
};

export const SENDER_TYPE_LABELS = {
    USER: 'Ứng viên',
    COMPANY: 'Nhà tuyển dụng',
};

export const RECEIVER_TYPE_LABELS = {
    USER: 'Ứng viên',
    COMPANY: 'Nhà tuyển dụng',
};

// ========== RECOMMENDATION ==========

export const INTERACTION_TYPE_LABELS = {
    VIEW: 'Xem',
    CLICK: 'Nhấn vào',
    SAVE: 'Lưu',
    APPLY: 'Ứng tuyển',
};

// ========== HELPERS ==========

/**
 * Trả về nhãn tiếng Việt cho một giá trị enum.
 * @param {Record<string,string>} map  Map enum (ví dụ JOB_STATUS_LABELS)
 * @param {string} value               Giá trị enum, ví dụ 'PENDING'
 * @param {string} [fallback]          Hiển thị khi không khớp (default = chính value)
 */
export const labelOf = (map, value, fallback) => {
    if (value == null) return fallback ?? '';
    if (typeof value !== 'string') return String(value);
    return map?.[value] ?? fallback ?? value;
};

// Hàm tiện cho từng enum thường dùng
export const jobStatusLabel = (v) => labelOf(JOB_STATUS_LABELS, v);
export const jobTypeLabel = (v) => labelOf(JOB_TYPE_LABELS, v);
export const experienceLevelLabel = (v) => labelOf(EXPERIENCE_LEVEL_LABELS, v);
export const salaryTypeLabel = (v) => labelOf(SALARY_TYPE_LABELS, v);
export const workingDaysLabel = (v) => labelOf(WORKING_DAYS_LABELS, v);
export const applicationStatusLabel = (v) => labelOf(APPLICATION_STATUS_LABELS, v);
export const accountStatusLabel = (v) => labelOf(ACCOUNT_STATUS_LABELS, v);
export const roleLabel = (v) => labelOf(ROLE_LABELS, v);
export const companyReviewStatusLabel = (v) => labelOf(COMPANY_REVIEW_STATUS_LABELS, v);
export const documentReviewStatusLabel = (v) => labelOf(DOCUMENT_REVIEW_STATUS_LABELS, v);
export const verificationLevelLabel = (v) => labelOf(VERIFICATION_LEVEL_LABELS, v);
export const industryLabel = (v) => labelOf(INDUSTRY_LABELS, v);
export const affiliationStatusLabel = (v) => labelOf(AFFILIATION_STATUS_LABELS, v);
export const submissionStatusLabel = (v) => labelOf(SUBMISSION_STATUS_LABELS, v);
export const businessDocumentTypeLabel = (v) => labelOf(BUSINESS_DOCUMENT_TYPE_LABELS, v);
export const companyAuditActionLabel = (v) => labelOf(COMPANY_AUDIT_ACTION_LABELS, v);
export const notificationTypeLabel = (v) => labelOf(NOTIFICATION_TYPE_LABELS, v);
export const recipientTypeLabel = (v) => labelOf(RECIPIENT_TYPE_LABELS, v);
export const reportStatusLabel = (v) => labelOf(REPORT_STATUS_LABELS, v);
export const reportTypeLabel = (v) => labelOf(REPORT_TYPE_LABELS, v);
export const severityLevelLabel = (v) => labelOf(SEVERITY_LEVEL_LABELS, v);
export const genderLabel = (v) => labelOf(GENDER_LABELS, v);
export const educationLevelLabel = (v) => labelOf(EDUCATION_LEVEL_LABELS, v);
export const employmentStatusLabel = (v) => labelOf(EMPLOYMENT_STATUS_LABELS, v);
export const cvStatusLabel = (v) => labelOf(CV_STATUS_LABELS, v);
export const socialPlatformLabel = (v) => labelOf(SOCIAL_PLATFORM_LABELS, v);
export const conversationTypeLabel = (v) => labelOf(CONVERSATION_TYPE_LABELS, v);
export const senderTypeLabel = (v) => labelOf(SENDER_TYPE_LABELS, v);
export const receiverTypeLabel = (v) => labelOf(RECEIVER_TYPE_LABELS, v);
export const interactionTypeLabel = (v) => labelOf(INTERACTION_TYPE_LABELS, v);
export const jobReviewActionLabel = (v) => labelOf(JOB_REVIEW_ACTION_LABELS, v);
