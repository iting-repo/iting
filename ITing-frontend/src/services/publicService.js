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

  trackBlogView: async (id) => {
    try {
      await axiosInstance.post(`/public/v2/blogs/${id}/view`);
    } catch { /* fire-and-forget */ }
  },

  getBanners: async (position) => {
    return axiosInstance.get("/public/banners", { params: { position } });
  },
};

export default publicService;
