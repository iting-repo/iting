import axiosInstance from "../utils/axiosInstance";

const publicContentService = {
  getFaqs: () => axiosInstance.get("/public/faqs"),
};

export default publicContentService;
