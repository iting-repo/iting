import axiosInstance from "../utils/axiosInstance";

/**
 * Credit balance + history cho EMPLOYER.
 * Balance được grant tự động khi subscription PAID (SUBSCRIPTION source),
 * và consume khi đăng tin / boost (sẽ wire sau).
 */
const creditService = {
  /** GET /api/me/credits → { balance, premiumUntil, premiumSource } */
  getBalance: () => axiosInstance.get("/me/credits"),

  /** GET /api/me/credits/history?page=&size= → paginated transactions */
  getHistory: (page = 0, size = 20) =>
    axiosInstance.get("/me/credits/history", { params: { page, size } }),
};

export default creditService;
