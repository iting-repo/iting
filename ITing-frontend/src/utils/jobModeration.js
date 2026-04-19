export const AI_REVIEW_STATUS = {
  APPROVED: "APPROVED",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  REJECTED: "REJECTED",
  CLEANED: "CLEANED",
  NOT_REVIEWED: "NOT_REVIEWED",
};

export const getAiReview = (job = {}) => {
  const review = job.aiReview || job.aiModeration || {};
  const status =
    review.status ||
    job.aiReviewStatus ||
    job.aiModerationStatus ||
    AI_REVIEW_STATUS.NOT_REVIEWED;

  return {
    status,
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
