import axiosInstance from "../utils/axiosInstance";

const jobAlertService = {
    /** Paginated list of jobs from followed companies. params: { page, size }. */
    list: (params) => axiosInstance.get('/candidates/job-alerts', { params }),
};

export default jobAlertService;
