// Map cvLanguage (do HR thiết lập) → nội dung CTA hiển thị cho ứng viên.
// Dùng chung cho JobApplyModal (trong popup ứng tuyển) và JobDetailPage (ngoài trang chi tiết).
export const CV_LANGUAGE_CTA = {
  VIETNAMESE: {
    badge: "🇻🇳 Yêu cầu tiếng Việt",
    cls: "bg-red-50 text-red-700 border-red-200",
    cvHint: "Hãy chọn CV viết bằng tiếng Việt. Hồ sơ nộp sai ngôn ngữ có thể bị loại.",
    coverHint: "Viết thư giới thiệu bằng tiếng Việt.",
  },
  ENGLISH: {
    badge: "🇬🇧 Required: English",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    cvHint: "HR requires an English CV. Please pick (or upload) a CV written in English.",
    coverHint: "Write your cover letter in English.",
  },
  BOTH: {
    badge: "🇻🇳 + 🇬🇧 Song ngữ",
    cls: "bg-purple-50 text-purple-700 border-purple-200",
    cvHint: "HR yêu cầu CV song ngữ (Việt + Anh). Đảm bảo CV của bạn có cả 2 ngôn ngữ.",
    coverHint: "Thư giới thiệu nên viết bằng tiếng Anh, kèm 1-2 câu tóm tắt tiếng Việt.",
  },
  ANY: {
    badge: "✓ Việt hoặc Anh",
    cls: "bg-gray-50 text-gray-600 border-gray-200",
    cvHint: "HR chấp nhận CV tiếng Việt hoặc tiếng Anh — chọn loại bạn tự tin nhất.",
    coverHint: "Viết thư giới thiệu bằng ngôn ngữ phù hợp với CV bạn nộp.",
  },
};

export const getCvLanguageCta = (lang) => CV_LANGUAGE_CTA[lang] || CV_LANGUAGE_CTA.ANY;
