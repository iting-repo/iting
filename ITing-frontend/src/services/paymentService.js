import axios from "../utils/axiosInstance";
import { trackEvent } from "../utils/analytics";

const paymentService = {
  /** List boost tiers (public). */
  getBoostTiers: () =>
    axios.get('/payments/boost-tiers').then((r) => r.data),

  /** Create a boost order for a job → returns QR + bank info. */
  boostJob: (jobId, tier) => {
    trackEvent('boost_job_initiated', { job_id: jobId, tier });
    return axios.post(`/hr/jobs/${jobId}/boost?tier=${tier}`).then((r) => r.data);
  },

  /** Poll order status (called every ~3s after showing QR). */
  getOrderStatus: (orderId) =>
    axios.get(`/me/payment-orders/${orderId}/status`).then((r) => r.data),
};

export default paymentService;
