import axiosInstance from "../utils/axiosInstance";

const facebookAuthService = {
  // Backend kỳ vọng `accessToken` (xem FacebookLoginRequest DTO).
  loginWithFacebook: async (accessToken) => {
    const response = await axiosInstance.post("/auth/facebook", { accessToken });
    return response;
  },
};

export default facebookAuthService;
