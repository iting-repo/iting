import axios from "../utils/axiosInstance";
import { trackEvent } from "../utils/analytics";

const subscriptionService = {
  /** Public: list tiers + prices. */
  getTiers: () =>
    axios.get('/payments/subscription-tiers').then((r) => r.data),

  /** Authenticated: current active subscription (returns active=false if none). */
  getMine: () =>
    axios.get('/me/subscription').then((r) => r.data),

  /** Subscribe / renew — returns SEPAY QR + bank info. */
  subscribe: (tier, autoRenew = true) => {
    trackEvent('subscription_initiated', { tier, autoRenew });
    return axios
      .post(`/me/subscription/subscribe?tier=${tier}&autoRenew=${autoRenew}`)
      .then((r) => r.data);
  },

  /** Cancel auto-renew (subscription stays active until expiry). */
  cancel: (reason) =>
    axios.post(`/me/subscription/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`)
        .then((r) => r.data),
};

export default subscriptionService;
