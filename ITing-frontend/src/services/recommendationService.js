import axiosInstance from "../utils/axiosInstance";

const recommendationService = {
  getHomepageRecommendations: async (limit = 10) => {
    return await axiosInstance.get(`/recommendations/homepage?limit=${limit}`);
  },

  trackInteraction: async (jobId, type) => {
    return await axiosInstance.post("/recommendations/interactions/track", {
      jobId,
      type
    });
  },

  trackSearch: async (keyword, location) => {
    return await axiosInstance.post("/recommendations/interactions/search", {
      keyword,
      location
    });
  }
};

export default recommendationService;
