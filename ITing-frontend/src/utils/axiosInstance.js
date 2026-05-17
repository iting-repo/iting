import axios from "axios";
import { API_BASE_URL } from "../config";
import { storage } from "./storage";
import { normalizeFormData } from "./stringUtils";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        // Auto-trim & normalize all string fields in request body
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            config.data = normalizeFormData(config.data);
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    (response) => {
        return response.data; // Return data directly to simplify services
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.error("Unauthorized: Token expired or invalid")
                storage.clearAuth();

                // Chỉ redirect nếu không phải đang ở trang login để tránh loop
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }
            // Trả về error response data để saga xử lý message
            return Promise.reject(error.response.data || error);
        }
        return Promise.reject(error);
    }
)
export default axiosInstance;