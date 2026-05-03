import axiosInstance from "../utils/axiosInstance";

const adminFaqService = {
    getFaqs: async (params = {}) => {
        return await axiosInstance.get("/admin/faqs", { params });
    },

    getFaqById: async (id) => {
        return await axiosInstance.get(`/admin/faqs/${id}`);
    },

    createFaq: async (data) => {
        return await axiosInstance.post("/admin/faqs", data);
    },

    updateFaq: async (id, data) => {
        return await axiosInstance.put(`/admin/faqs/${id}`, data);
    },

    deleteFaq: async (id) => {
        return await axiosInstance.delete(`/admin/faqs/${id}`);
    },

    togglePublished: async (id) => {
        return await axiosInstance.patch(`/admin/faqs/${id}/toggle-published`);
    },
};

export default adminFaqService;
