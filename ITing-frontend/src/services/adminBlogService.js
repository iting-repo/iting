import axiosInstance from "../utils/axiosInstance";

const adminBlogService = {
  getBlogs: async (params = {}) => {
    const response = await axiosInstance.get("/admin/blogs", { params });
    return response;
  },

  getBlogById: async (id) => {
    const response = await axiosInstance.get(`/admin/blogs/${id}`);
    return response;
  },

  createBlog: async (data) => {
    const response = await axiosInstance.post("/admin/blogs", data);
    return response;
  },

  updateBlog: async (id, data) => {
    const response = await axiosInstance.put(`/admin/blogs/${id}`, data);
    return response;
  },

  deleteBlog: async (id) => {
    const response = await axiosInstance.delete(`/admin/blogs/${id}`);
    return response;
  },
};

export default adminBlogService;
