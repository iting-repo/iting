import axiosInstance from "../utils/axiosInstance";

const reportService = {
    /**
     * Tạo báo cáo vi phạm mới
     * @param {Object} reportData - Dữ liệu báo cáo
     */
    createReport: async (reportData) => {
        try {
            const response = await axiosInstance.post("/reports", reportData);
            return response;
        } catch (error) {
            console.error("[API] POST /reports - error:", error);
            throw error;
        }
    }
};

export default reportService;
