import axios from '../utils/axiosInstance';

const adminMarketingService = {
  utmFunnel: (days = 30) =>
    axios.get(`/api/admin/marketing/utm-funnel?days=${days}`).then((r) => r.data),
  topReferrers: (limit = 20) =>
    axios.get(`/api/admin/marketing/top-referrers?limit=${limit}`).then((r) => r.data),
  overview: (days = 30) =>
    axios.get(`/api/admin/marketing/overview?days=${days}`).then((r) => r.data),
  recentReferrals: (limit = 50) =>
    axios.get(`/api/admin/marketing/recent-referrals?limit=${limit}`).then((r) => r.data),
};

export default adminMarketingService;
