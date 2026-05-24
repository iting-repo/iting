import axiosInstance from "../utils/axiosInstance";

export const employerCandidateService = {
  /**
   * Tìm kiếm ứng viên — POST /hr/candidates/search với RequestBody
   * Backend: HrCandidateController@PostMapping("/search")
   */
  search: async (filters) => {
    const {
      keyword = "",
      position = "all",
      level = "all",
      location = "all",
      workType = "all",
      experience = "all",
      degree = "all",
      salary = "all",
      skills = [],
      onlyAvailable = false,
      employerLocation = "",
      industryContext = "",
      page = 0,
      size = 6,
    } = filters;

    // Backend normalizeAllValue() handles "all" -> null internally,
    // but we clean up here for clarity
    const body = {
      keyword: keyword.trim() || null,
      position: position === "all" ? null : position,
      level: level === "all" ? null : level,
      location: location === "all" ? null : location,
      workType: workType === "all" ? null : workType,
      experience: experience === "all" ? null : experience,
      degree: degree === "all" ? null : degree,
      salary: salary === "all" ? null : salary,
      skills: Array.isArray(skills) ? skills : [],
      onlyAvailable: Boolean(onlyAvailable),
      employerLocation: employerLocation || null,
      industryContext: industryContext || null,
      page,
      size,
    };

    return await axiosInstance.post("/hr/candidates/search", body);
  },

  getFullProfile: (candidateId) =>
    axiosInstance.get(`/hr/candidates/${candidateId}/profile`),

  /**
   * AI match-by-job: dùng embedding của 1 job để tìm ứng viên openToWork=true.
   * Backend trừ 5 credits/lần (HrCandidateController.MATCH_BY_JOB_CREDIT_COST).
   * Throws 402 với code=INSUFFICIENT_CREDITS nếu thiếu credits.
   */
  matchByJob: (jobId, { page = 0, size = 20, locationOverride } = {}) =>
    axiosInstance.post(`/hr/candidates/match-by-job/${jobId}`, {
      page,
      size,
      locationOverride: locationOverride || null,
    }),
};
