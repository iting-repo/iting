import axiosInstance from "../utils/axiosInstance";

const publicService = {
  getHomeStats: async () => {
    return axiosInstance.get("/public/stats");
  },

  getSalaryReport: async (params) => {
    return axiosInstance.get("/jobs/salary-report", { params });
  },

  getBlogs: async (params) => {
    return axiosInstance.get("/public/v2/blogs", { params });
  },

  getBlogBySlug: async (slug) => {
    return axiosInstance.get(`/public/v2/blogs/${slug}`);
  },
};

export default publicService;
