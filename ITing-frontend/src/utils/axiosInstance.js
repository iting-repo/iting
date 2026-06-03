import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";
import { storage } from "./storage";
import { normalizeFormData } from "./stringUtils";

// Debounce 402 toast: tránh nhiều request cùng lúc spam toast trùng nhau.
let last402At = 0;

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
            // 402 Payment Required: quota tier-gated (job/boost/talent-pool).
            // Backend trả message tiếng Việt → toast + CTA nâng cấp.
            if (error.response.status === 402) {
                const now = Date.now();
                if (now - last402At > 1500) {
                    last402At = now;
                    const body = error.response.data;
                    const msg = (body && (body.message || body.error))
                        || "Tính năng này yêu cầu nâng cấp gói. Vui lòng nâng cấp để tiếp tục.";
                    toast.error(msg, {
                        duration: 6000,
                        action: {
                            label: "Nâng cấp gói",
                            onClick: () => {
                                window.location.href = "/employer/subscriptions";
                            },
                        },
                    });
                }
            }
            // Trả về error response data để saga xử lý message
            // Gắn httpStatus + httpStatusCode lên body để caller có thể phân biệt 402 vs other
            const body = error.response.data;
            if (body && typeof body === "object") {
                if (body.httpStatus == null) body.httpStatus = error.response.status;
            }
            return Promise.reject(body || error);
        }
        return Promise.reject(error);
    }
)
export default axiosInstance;