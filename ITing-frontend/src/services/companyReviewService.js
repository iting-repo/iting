import axios from "../utils/axiosInstance";
import { trackEvent } from "../utils/analytics";

const companyReviewService = {
  /** Public: get approved reviews + aggregate stats for a company. */
  list: (companyId) =>
    axios.get(`/public/companies/${companyId}/reviews`),

  /** Authenticated: submit new review (status PENDING until moderated). */
  submit: (companyId, payload) => {
    trackEvent('company_review_submitted', { company_id: companyId });
    return axios.post(`/companies/${companyId}/reviews`, payload);
  },

  toggleHelpful: (reviewId) =>
    axios.post(`/reviews/${reviewId}/helpful`),

  report: (reviewId) =>
    axios.post(`/reviews/${reviewId}/report`),

  /** Delete own review. */
  delete: (reviewId) =>
    axios.delete(`/reviews/${reviewId}`),
};

export default companyReviewService;
