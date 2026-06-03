import axiosInstance from "../utils/axiosInstance";

const adminProfileService = {
  // Lấy hồ sơ admin hiện tại (BE auto-create row + staffCode lần đầu)
  getProfile: () => axiosInstance.get("/admin/me/profile"),
};

export default adminProfileService;
