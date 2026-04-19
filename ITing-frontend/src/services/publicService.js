import axiosInstance from "../utils/axiosInstance";

const publicService = {
  getHomeStats: async () => {
    return axiosInstance.get("/public/stats");
  },
  
  // You can add more public endpoints here later (e.g. categories, blogs)
};

export default publicService;
