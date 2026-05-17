import axiosInstance from "../utils/axiosInstance";

const adminStatsService = {
  getDetailedStats: async (dateRange = "7days") => {
    try {
      const response = await axiosInstance.get("/admin/stats/detailed", {
        params: { dateRange },
      });
      return response;
    } catch (error) {
      console.error("Error fetching detailed stats:", error);
      throw error;
    }
  },
};

export default adminStatsService;
