import axiosInstance from "../utils/axiosInstance";

const googleAuthService = {
  loginWithGoogle: async (tokenId) => {
    const response = await axiosInstance.post("/auth/google", { tokenId });
    return response;
  },
};

export default googleAuthService;
