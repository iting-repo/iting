import axiosInstance from "../utils/axiosInstance";

const adminReportService = {
  getReports: async (params) => {
    try {
      const response = await axiosInstance.get("/admin/reports", { params });
      return response;
    } catch (error) {
      console.error("[API] GET /admin/reports - error:", error);
      throw error;
    }
  },

  getReportStats: async () => {
    try {
      const response = await axiosInstance.get("/admin/reports/stats");
      return response;
    } catch (error) {
      console.error("[API] GET /admin/reports/stats - error:", error);
      throw error;
    }
  },

  handleReport: async (id, status, note) => {
    try {
      const response = await axiosInstance.put(`/admin/reports/${id}/handle`, null, {
        params: { status, note },
      });
      return response;
    } catch (error) {
      console.error(`[API] PUT /admin/reports/${id}/handle - error:`, error);
      throw error;
    }
  },

  getReportById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/reports/${id}`);
      return response;
    } catch (error) {
      console.error(`[API] GET /admin/reports/${id} - error:`, error);
      throw error;
    }
  },
};

export default adminReportService;
