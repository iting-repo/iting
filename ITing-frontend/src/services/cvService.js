import axiosInstance from "../utils/axiosInstance";

const cvService = {
  getRecentCVs: async () => {
    return axiosInstance.get("/candidates/cvs/recent");
  },

  getUserCVs: async () => {
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

  parseCV: async (formData) => {
    return axiosInstance.post("/candidates/cvs/parse", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default cvService;
