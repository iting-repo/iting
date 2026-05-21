import axiosInstance from "../utils/axiosInstance";

/**
 * HR pipeline stage management:
 *   Quản lý giai đoạn tuyển dụng của application (SCREENING → ... → HIRED/REJECTED).
 *   Khác với ApplicationStatus (PENDING/ACCEPTED/REJECTED) — pipeline là workflow HR-side.
 */
const pipelineService = {
  /** Danh sách stage hợp lệ (theo backend whitelist). */
  getStages: async () => {
    return await axiosInstance.get("/hr/pipeline/stages");
  },

  /**
   * Chuyển stage của 1 application.
   * @param {number} applyFormId
   * @param {number} jobId
   * @param {{ toStage: string, note?: string, sendEmail?: boolean, templateId?: number }} payload
   */
  moveStage: async (applyFormId, jobId, payload) => {
    return await axiosInstance.post(
      `/hr/pipeline/applications/${applyFormId}/${jobId}/move`,
      payload,
    );
  },
};

export default pipelineService;
