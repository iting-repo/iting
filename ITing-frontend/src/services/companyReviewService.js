import axios from "../utils/axiosInstance";
import { trackEvent } from "../utils/analytics";

const companyReviewService = {
  /** Public: get approved reviews + aggregate stats for a company. */
  list: (companyId) =>
    axios.get(`/public/companies/${companyId}/reviews-v2`).then((r) => r.data),

  /** Authenticated: submit new review (status PENDING until moderated). */
  submit: (companyId, payload) => {
    trackEvent('company_review_submitted', { company_id: companyId });
    return axios.post(`/companies/${companyId}/reviews-v2`, payload).then((r) => r.data);
  },

  toggleHelpful: (reviewId) =>
    axios.post(`/reviews/${reviewId}/helpful`).then((r) => r.data),

  report: (reviewId) =>
    axios.post(`/reviews/${reviewId}/report`).then((r) => r.data),
};

export default companyReviewService;
