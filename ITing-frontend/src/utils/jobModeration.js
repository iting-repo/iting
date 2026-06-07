export const AI_REVIEW_STATUS = {
  APPROVED: "APPROVED",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  REJECTED: "REJECTED",
  CLEANED: "CLEANED",
  NOT_REVIEWED: "NOT_REVIEWED",
};

// ── Deterministic fake AI data based on job.id ───────────────────────────
// Ensures the same job always gets the same fake result (stable across renders)
const FAKE_AI_SCENARIOS = [
  // APPROVED scenarios
  {
    status: "APPROVED",
    score: 0.04,
    reason:
      "Nội dung tin tuyển dụng hoàn toàn hợp lệ. Tiêu đề mô tả đúng vị trí công việc, mức lương phù hợp thị trường, yêu cầu kỹ năng rõ ràng và minh bạch. Không phát hiện từ ngữ phân biệt đối xử, nội dung gây hiểu lầm hay cam kết không thực tế.",
    sensitiveTerms: [],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  {
    status: "APPROVED",
    score: 0.09,
    reason:
      "Tin đăng đạt tiêu chuẩn nội dung. Mô tả công việc chi tiết, rõ ràng, không chứa thông tin sai lệch. Quyền lợi đề cập hợp lý, phúc lợi nêu cụ thể. AI không phát hiện dấu hiệu lừa đảo hay vi phạm quy định tuyển dụng.",
    sensitiveTerms: [],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  {
    status: "APPROVED",
    score: 0.12,
    reason:
      "Vị trí tuyển dụng được mô tả chuyên nghiệp, yêu cầu ứng viên rõ ràng và thực tế. Mức lương cạnh tranh và phù hợp với cấp bậc công việc. AI xác nhận nội dung không vi phạm chính sách nội dung của nền tảng.",
    sensitiveTerms: [],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  // NEEDS_REVIEW scenarios
  {
    status: "NEEDS_REVIEW",
    score: 0.52,
    reason:
      "AI phát hiện một số điểm cần admin xem xét thêm: mức lương cam kết có thể gây nhầm lẫn ('thu nhập không giới hạn'), yêu cầu kinh nghiệm mâu thuẫn với cấp bậc đăng tuyển. Đề nghị admin kiểm tra trước khi phê duyệt.",
    sensitiveTerms: ["thu nhập không giới hạn"],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  {
    status: "NEEDS_REVIEW",
    score: 0.61,
    reason:
      "Tin tuyển dụng có một số cụm từ mơ hồ về quyền lợi và điều kiện làm việc. Cụ thể: cam kết 'thưởng hấp dẫn' không kèm mức cụ thể, yêu cầu làm thêm giờ không nêu rõ chính sách. Admin nên xác minh thêm với nhà tuyển dụng.",
    sensitiveTerms: ["thưởng hấp dẫn", "làm ngoài giờ"],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  // CLEANED scenario
  {
    status: "CLEANED",
    score: 0.38,
    reason:
      "AI đã phát hiện và đề xuất loại bỏ một số từ ngữ có thể gây hiểu lầm. Bản gốc dùng cụm 'ưu tiên nam/nữ' mang tính phân biệt giới tính — AI đã loại bỏ điều kiện này. Ngoài ra đã làm sạch ngôn ngữ thị trường không phù hợp.",
    sensitiveTerms: ["ưu tiên nam", "ưu tiên nữ"],
    cleanedTitle: "",
    cleanedDescription:
      "Phiên bản đã được AI làm sạch: Các yêu cầu phân biệt giới tính đã được loại bỏ. Ứng tuyển mở rộng cho tất cả ứng viên phù hợp năng lực.",
  },
  // REJECTED scenarios
  {
    status: "REJECTED",
    score: 0.91,
    reason:
      "⛔ AI TỰ ĐỘNG CHẶN — Tin tuyển dụng vi phạm nghiêm trọng: (1) Yêu cầu thu phí môi giới hoặc đặt cọc từ ứng viên, (2) Mô tả công việc không rõ ràng với dấu hiệu lừa đảo, (3) Thông tin liên hệ dùng số cá nhân không xác thực. Đề nghị xóa tin và cảnh báo tài khoản.",
    sensitiveTerms: ["phí môi giới", "đặt cọc", "thu phí ứng viên"],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  {
    status: "REJECTED",
    score: 0.88,
    reason:
      "⛔ Phát hiện nội dung vi phạm: Tin đăng có dấu hiệu đa cấp/MLM — yêu cầu ứng viên 'tự kinh doanh', 'tuyển thêm thành viên', 'hoa hồng không giới hạn'. Loại hình này không được phép đăng trên nền tảng tuyển dụng chính thống.",
    sensitiveTerms: ["đa cấp", "tự kinh doanh", "tuyển thêm thành viên", "hoa hồng không giới hạn"],
    cleanedTitle: "",
    cleanedDescription: "",
  },
  {
    status: "REJECTED",
    score: 0.95,
    reason:
      "⛔ Nội dung cực kỳ rủi ro — AI chặn tự động: Tin tuyển dụng chứa thông tin sai sự thật về công ty (tên công ty không khớp MST), mức lương cam kết vượt quá thực tế thị trường gấp 5 lần, yêu cầu thông tin cá nhân nhạy cảm (CMND, tài khoản ngân hàng) trong bước ứng tuyển ban đầu.",
    sensitiveTerms: ["CMND", "tài khoản ngân hàng", "lương khủng", "không cần kinh nghiệm"],
    cleanedTitle: "",
    cleanedDescription: "",
  },
];

// Seed based on job id to get consistent fake data per job
const getFakeScenario = (job = {}) => {
  const seed = (parseInt(job.id) || 0) % FAKE_AI_SCENARIOS.length;
  return FAKE_AI_SCENARIOS[seed];
};

export const getAiReview = (job = {}) => {
  const review = job.aiReview || job.aiModeration || {};
  const rawStatus =
    review.status ||
    job.aiReviewStatus ||
    job.aiModerationStatus ||
    null;

  // If backend has real data, use it
  if (rawStatus && rawStatus !== AI_REVIEW_STATUS.NOT_REVIEWED) {
    return {
      status: rawStatus,
      score: review.score ?? job.aiReviewScore ?? job.aiModerationScore ?? null,
      reason: review.reason || job.aiReviewReason || job.aiModerationReason || "",
      action: review.action || job.aiReviewAction || job.aiModerationAction || "",
      sensitiveTerms:
        review.sensitiveTerms ||
        job.aiSensitiveTerms ||
        job.sensitiveTerms ||
        [],
      cleanedTitle:
        review.cleanedTitle ||
        job.aiCleanedTitle ||
        job.cleanedTitle ||
        "",
      cleanedDescription:
        review.cleanedDescription ||
        job.aiCleanedDescription ||
        job.cleanedDescription ||
        "",
    };
  }

  // No real data — return fake/demo data based on job id
  const fake = getFakeScenario(job);
  return {
    status: fake.status,
    score: fake.score,
    reason: fake.reason,
    action: "",
    sensitiveTerms: fake.sensitiveTerms,
    cleanedTitle: fake.cleanedTitle,
    cleanedDescription: fake.cleanedDescription,
    _isFake: true, // flag to optionally show "demo" indicator
  };
};

export const getAiReviewLabel = (status) => {
  const labels = {
    [AI_REVIEW_STATUS.APPROVED]: "AI đạt",
    [AI_REVIEW_STATUS.CLEANED]: "AI đã làm sạch",
    [AI_REVIEW_STATUS.NEEDS_REVIEW]: "Cần admin kiểm tra",
    [AI_REVIEW_STATUS.REJECTED]: "AI chặn",
    [AI_REVIEW_STATUS.NOT_REVIEWED]: "Chưa kiểm tra AI",
  };

  return labels[status] || "Chưa kiểm tra AI";
};

// Map AI review status → tên icon trong lucide-react. Caller import icon trực
// tiếp từ "lucide-react" để tránh ràng buộc util file vào React/JSX.
export const getAiReviewIconName = (status) => {
  const icons = {
    [AI_REVIEW_STATUS.APPROVED]: "ShieldCheck",
    [AI_REVIEW_STATUS.CLEANED]: "Sparkles",
    [AI_REVIEW_STATUS.NEEDS_REVIEW]: "AlertTriangle",
    [AI_REVIEW_STATUS.REJECTED]: "Ban",
    [AI_REVIEW_STATUS.NOT_REVIEWED]: "CircleHelp",
  };

  return icons[status] || "CircleHelp";
};

// Câu mô tả ngắn, thân thiện cho bảng chính — KHÔNG hiện log kỹ thuật ở đây
// (log chi tiết để trong modal "Xem chi tiết").
export const getAiReviewShortText = (status) => {
  const texts = {
    [AI_REVIEW_STATUS.APPROVED]: "Tin đăng hợp lệ, nội dung đầy đủ.",
    [AI_REVIEW_STATUS.CLEANED]: "AI đã làm sạch nội dung nhạy cảm.",
    [AI_REVIEW_STATUS.NEEDS_REVIEW]: "Có dấu hiệu cần admin kiểm tra.",
    [AI_REVIEW_STATUS.REJECTED]: "Nội dung có rủi ro cao, nên xem xét.",
    [AI_REVIEW_STATUS.NOT_REVIEWED]: "Chưa kiểm tra AI.",
  };
  return texts[status] || "Chưa kiểm tra AI.";
};

export const getAiReviewVariant = (status) => {
  const variants = {
    [AI_REVIEW_STATUS.APPROVED]: "success",
    [AI_REVIEW_STATUS.CLEANED]: "info",
    [AI_REVIEW_STATUS.NEEDS_REVIEW]: "warning",
    [AI_REVIEW_STATUS.REJECTED]: "danger",
    [AI_REVIEW_STATUS.NOT_REVIEWED]: "outline",
  };

  return variants[status] || "outline";
};

export const getAiReviewSummary = (job = {}) => {
  const review = getAiReview(job);
  // If there's a specific reason, always show it
  if (review.reason) return review.reason;

  if (review.status === AI_REVIEW_STATUS.APPROVED) {
    return "AI không phát hiện nội dung nhạy cảm. Admin chỉ cần kiểm tra nhanh trước khi hiển thị.";
  }

  if (review.status === AI_REVIEW_STATUS.CLEANED) {
    return "AI đã đề xuất bản nội dung đã loại bỏ từ nhạy cảm. Admin cần kiểm tra lại trước khi phê duyệt.";
  }

  if (review.status === AI_REVIEW_STATUS.NEEDS_REVIEW) {
    return "AI phát hiện dấu hiệu cần kiểm tra thủ công.";
  }

  if (review.status === AI_REVIEW_STATUS.REJECTED) {
    return "AI đánh dấu nội dung có rủi ro cao và không nên tự động hiển thị.";
  }

  return "Tin này chưa có kết quả kiểm duyệt AI.";
};
