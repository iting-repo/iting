import axiosInstance from "../utils/axiosInstance";

const companyService = {
  // Lấy thông tin công ty của tài khoản đang đăng nhập
  getMyCompany: async () => {
    const response = await axiosInstance.get('/companies');
    return response;
  },

  // Cập nhật thông tin công ty cơ bản
  updateCompanyBasicInfo: async (id, companyData) => {
    const response = await axiosInstance.put(`/companies/${id}/basic-info`, companyData);
    return response;
  },

  // Đăng tin tuyển dụng mới
  createEmployerJob: async (jobData) => {
    const response = await axiosInstance.post("/employer/jobs", jobData);
    return response.data;
  },

  // Đăng tin tuyển dụng mới
  createJob: async (jobData) => {
    const payload = {
      title: jobData.title?.trim() || "",
      position: Array.isArray(jobData.position)
        ? jobData.position.join(", ")
        : jobData.position || "",
      techRequired: Array.isArray(jobData.techRequired)
        ? jobData.techRequired.join(", ")
        : jobData.techRequired || "",
      jobType: jobData.jobType || null,
      experienceLevel: jobData.experienceLevel || null,
      workingDays: jobData.workingDays?.trim() || "",
      minSalary:
        jobData.minSalary === "" || jobData.minSalary == null
          ? null
          : Number(jobData.minSalary),
      maxSalary:
        jobData.maxSalary === "" || jobData.maxSalary == null
          ? null
          : Number(jobData.maxSalary),
      salaryType: jobData.salaryType || null,
      maxAccept:
        jobData.maxAccept === "" || jobData.maxAccept == null
          ? 0
          : Number(jobData.maxAccept),
      dueDate: jobData.dueDate || null,
      province: jobData.province || "",
      ward: jobData.ward || "",
      address: jobData.address?.trim() || "",
      locId:
        jobData.locId === "" || jobData.locId == null
          ? null
          : Number(jobData.locId),
      description: jobData.description?.trim() || "",
      responsibilities: jobData.responsibilities?.trim() || "",
      requirements: jobData.requirements?.trim() || "",
      benefits: jobData.benefits?.trim() || "",
    };

    const response = await axiosInstance.post("/api/employer/jobs", payload);
    return response.data;
  },
};

export default companyService;
