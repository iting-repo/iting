import axiosInstance from "../utils/axiosInstance";

const adminDashboardService = {
  getStats: async () => {
    const response = await axiosInstance.get("/admin/dashboard/stats");
    return response;
  },
};

export default adminDashboardService;
