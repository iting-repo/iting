import axiosInstance from '../utils/axiosInstance';

const companyService = {
    // API Get Company Profile
    getCompanyProfile: async (id) => {
        // GET /api/companies/{id}
        const response = await axiosInstance.get(`/companies/${id}`);
        return response;
    },
};

export default companyService;
