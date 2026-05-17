import axios from '../utils/axiosInstance';

/**
 * Marketing / growth endpoints (public + authenticated).
 */
const marketingService = {
  // ── Newsletter ──
  subscribeNewsletter: (payload) =>
    axios.post('/public/newsletter/subscribe', payload),

  unsubscribeNewsletter: (token) =>
    axios.get(`/public/newsletter/unsubscribe?token=${encodeURIComponent(token)}`),

  // ── Referral ──
  getMyReferral: () => axios.get('/me/referral'),
};

export default marketingService;
