import axiosInstance from "../utils/axiosInstance";

export const employerCandidateService = {
  search: (payload) => axiosInstance.post("/employers/candidates/search", payload),
  getFullProfile: (candidateId) => axiosInstance.get(`/employers/candidates/${candidateId}/profile`),
};

