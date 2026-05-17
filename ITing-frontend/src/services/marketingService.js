import axios from './axiosInstance';

/**
 * Marketing / growth endpoints (public + authenticated).
 */
const marketingService = {
  // ── Newsletter ──
  subscribeNewsletter: (payload) =>
    axios.post('/api/public/newsletter/subscribe', payload).then((r) => r.data),

  unsubscribeNewsletter: (token) =>
    axios.get(`/api/public/newsletter/unsubscribe?token=${encodeURIComponent(token)}`).then((r) => r.data),

  // ── Referral ──
  getMyReferral: () => axios.get('/api/me/referral').then((r) => r.data),
};

export default marketingService;
