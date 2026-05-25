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

  /** Upload 1 ảnh cho blog content. Returns { url }. Max 5MB, image/*. */
  uploadImage: async (file) => {
    const form = new FormData();
    form.append("file", file);
    return await axiosInstance.post("/admin/blogs/upload-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default adminBlogService;
