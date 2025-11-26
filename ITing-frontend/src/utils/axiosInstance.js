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
        const token = localStorage.getItem('jwtToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.error("Unauthorized: Token expired or invalid")
                localStorage.removeItem('jwtToken')
                window.location.href = '/login'
                // Xử lí đoạn này sau(Trước mắt là auto đúng cái đã)
            }
            else if (error.response.status === 403) {
                console.error("Forbidden: You don't have permission to access this resource.")
                // Xử lí đoạn này sau(Trước mắt là auto đúng cái đã)
            }
        }
        return Promise.reject(error);
    }
)
export default axiosInstance;