import axiosInstance from "../utils/axiosInstance";

/**
 * HR recruitment dashboard reports — số liệu tổng quan từ backend
 * HrReportController. Tách khỏi reportService.js (vi phạm) để khỏi nhầm.
 */
const hrReportService = {
  /**
   * GET /api/hr/reports/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Range mặc định backend: 30 ngày gần nhất nếu omit.
   */
  getOverview: ({ from, to } = {}) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return axiosInstance.get("/hr/reports/overview", { params });
  },
};

export default hrReportService;
