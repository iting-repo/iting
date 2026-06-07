import axios from "../utils/axiosInstance";

/** Admin: quản lý giá / quyền lợi / quota các gói HR Premium. */
const adminSubscriptionService = {
  /** Tất cả gói kèm giá hiệu lực (gồm cả gói đang ẩn). */
  listTiers: () => axios.get("/admin/subscription-tiers"),

  /** Tạo gói mới. */
  createTier: (data) => axios.post("/admin/subscription-tiers", data),

  /** Cập nhật (partial) một gói theo code. */
  updateTier: (code, data) =>
    axios.put(`/admin/subscription-tiers/${code}`, data),

  /** Xóa một gói theo code. */
  deleteTier: (code) =>
    axios.delete(`/admin/subscription-tiers/${code}`),
};

export default adminSubscriptionService;
