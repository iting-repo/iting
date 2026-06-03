package com.iting.jobportal.job.entity.enums;

/**
 * Yêu cầu ngôn ngữ CV / Cover Letter mà HR đặt cho job.
 *
 * <p>HR chọn loại để ứng viên biết nộp đúng loại CV (Việt / Anh / song ngữ). Default = ANY khi HR
 * không bắt buộc.
 */
public enum CvLanguage {
  /** Bắt buộc CV tiếng Việt */
  VIETNAMESE,
  /** Bắt buộc CV tiếng Anh */
  ENGLISH,
  /** Bắt buộc cả 2 (song ngữ) */
  BOTH,
  /** Chấp nhận cả Việt hoặc Anh */
  ANY
}
