import axiosInstance from "../utils/axiosInstance";

const publicService = {
  getHomeStats: async () => {
    return axiosInstance.get("/public/stats");
  },

  getSalaryReport: async (params) => {
    return axiosInstance.get("/jobs/salary-report", { params });
  },
};

export default publicService;
