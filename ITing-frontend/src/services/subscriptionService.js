import axios from "../utils/axiosInstance";
import { trackEvent } from "../utils/analytics";

const subscriptionService = {
  /** Public: list tiers + prices. */
  getTiers: () =>
    axios.get('/payments/subscription-tiers'),

  /** Authenticated: current active subscription (returns active=false if none). */
  getMine: () =>
    axios.get('/me/subscription'),

  /** Subscribe / renew — returns SEPAY QR + bank info. */
  subscribe: (tier, autoRenew = true) => {
    trackEvent('subscription_initiated', { tier, autoRenew });
    return axios
      .post(`/me/subscription/subscribe?tier=${tier}&autoRenew=${autoRenew}`);
  },

  /** Cancel auto-renew (subscription stays active until expiry). */
  cancel: (reason) =>
    axios.post(`/me/subscription/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
};

export default subscriptionService;
