import axios from "../utils/axiosInstance";

/** Admin: quản lý giá / quyền lợi / quota các gói HR Premium. */
const adminSubscriptionService = {
  /** Tất cả gói kèm giá hiệu lực (gồm cả gói đang ẩn). */
  listTiers: () => axios.get("/admin/subscription-tiers"),

  /** Cập nhật (partial) một gói theo code (BASIC/PRO/ENTERPRISE). */
  updateTier: (code, data) =>
    axios.put(`/admin/subscription-tiers/${code}`, data),
};

export default adminSubscriptionService;
