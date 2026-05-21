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
};
