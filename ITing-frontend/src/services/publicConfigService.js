import axios from "../utils/axiosInstance";

/** Cờ tính năng công khai (không cần đăng nhập, không bị chặn khi bảo trì). */
const publicConfigService = {
  /** => { allowCompanyReviews: boolean } */
  getSettings: () => axios.get("/public/settings"),
};

export default publicConfigService;
