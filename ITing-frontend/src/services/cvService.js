import axiosInstance from "../utils/axiosInstance";

const cvService = {
  getRecentCVs: async () => {
    return axiosInstance.get("/candidates/cvs/recent");
  },

  uploadCV: async (formData) => {
    return axiosInstance.post("/candidates/cvs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getCVCount: async () => {
    return axiosInstance.get("/candidates/cvs/count");
  },
};

export default cvService;
