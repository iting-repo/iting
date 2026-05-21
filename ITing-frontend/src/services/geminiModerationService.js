/**
 * geminiModerationService.js
 * Gọi Google Gemini API để kiểm duyệt nội dung tin tuyển dụng trước khi đăng.
 * Phát hiện: từ ngữ xúc phạm, thông tin sai lệch, cam kết không thực tế, phân biệt đối xử.
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Kiểm duyệt tin tuyển dụng bằng Gemini AI.
 * @param {Object} jobData - Dữ liệu bài đăng
 * @returns {Promise<{passed: boolean, issues: string[], flaggedTerms: string[], suggestion: string}>}
 */
export const moderateJobWithGemini = async (jobData) => {
  const prompt = `Bạn là hệ thống kiểm duyệt nội dung tin tuyển dụng cho nền tảng việc làm IT tại Việt Nam.

Hãy phân tích TIN TUYỂN DỤNG sau và trả về kết quả theo định dạng JSON CHÍNH XÁC bên dưới.

--- TIN TUYỂN DỤNG ---
Tiêu đề: ${jobData.title || ""}
Vị trí: ${jobData.position || ""}
Mô tả công việc: ${jobData.description || ""}
Yêu cầu: ${jobData.requirements || ""}
Quyền lợi: ${jobData.benefits || ""}
Trách nhiệm: ${jobData.responsibilities || ""}
Mức lương: ${jobData.salaryType === "NEGOTIABLE" ? "Thỏa thuận" : `${jobData.minSalary || 0} - ${jobData.maxSalary || 0} VNĐ`}
---

Kiểm tra các vấn đề sau:
1. Từ ngữ xúc phạm, thô tục (ví dụ: ngu, ngu ngốc, đần, óc chó, etc.)
2. Phân biệt đối xử (giới tính, độ tuổi, tôn giáo, vùng miền)
3. Thông tin sai lệch hoặc không thực tế (lương cao bất thường, cam kết vô lý)
4. Dấu hiệu lừa đảo (yêu cầu đặt cọc, phí môi giới, đa cấp)
5. Nội dung mơ hồ, thiếu chuyên nghiệp
6. Thiếu thông tin quan trọng cần bổ sung

Trả về JSON với cấu trúc:
{
  "passed": true/false,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "issues": ["danh sách các vấn đề phát hiện bằng tiếng Việt"],
  "flaggedTerms": ["các từ/cụm từ bị gắn cờ"],
  "suggestion": "Gợi ý cải thiện ngắn gọn bằng tiếng Việt",
  "summary": "Tóm tắt đánh giá tổng thể bằng tiếng Việt (1-2 câu)"
}

Chỉ trả về JSON, không có text khác.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid Gemini response format");

    const result = JSON.parse(jsonMatch[0]);
    return {
      passed: result.passed ?? true,
      riskLevel: result.riskLevel || "LOW",
      issues: Array.isArray(result.issues) ? result.issues : [],
      flaggedTerms: Array.isArray(result.flaggedTerms) ? result.flaggedTerms : [],
      suggestion: result.suggestion || "",
      summary: result.summary || "",
    };
  } catch (err) {
    console.error("Gemini moderation error:", err);
    // Fallback: allow submission but warn
    return {
      passed: true,
      riskLevel: "LOW",
      issues: [],
      flaggedTerms: [],
      suggestion: "",
      summary: "Không thể kết nối Gemini AI — bỏ qua kiểm duyệt tự động.",
      _error: true,
    };
  }
};
