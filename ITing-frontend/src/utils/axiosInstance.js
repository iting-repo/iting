import axios from "axios";
import { API_BASE_URL } from "../config";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        console.log("[DEBUG] Axios Interceptor - Token from storage:", token ? "FOUND" : "MISSING", token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log("[DEBUG] Axios Interceptor - Header set:", config.headers.Authorization);
        } else {
            console.warn("[DEBUG] Axios Interceptor - No token found in localStorage");
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
                localStorage.removeItem('access_token')
                localStorage.removeItem('user_role')
                localStorage.removeItem('user_info');

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