import axiosInstance from "../utils/axiosInstance";

/**
 * Offer Letter — Phase B.
 * HR-side: tạo / thu hồi / xem PDF.
 * Candidate-side: list / accept / decline / xem PDF.
 */
const offerService = {
   // ─── HR ───────────────────────────────────────────────────────

   /**
    * @param {{
    *   applyFormId: number, jobId: number, position: string,
    *   salaryAmount?: number, salaryCurrency?: string, salaryType?: 'MONTH'|'YEAR',
    *   startDate?: string, expiresAt: string, notes?: string
    * }} payload
    */
   create: async (payload) => {
      return await axiosInstance.post("/hr/offers", payload);
   },

   revoke: async (offerId) => {
      return await axiosInstance.post(`/hr/offers/${offerId}/revoke`);
   },

   getByIdAsHr: async (offerId) => {
      return await axiosInstance.get(`/hr/offers/${offerId}`);
   },

   listByApplication: async (applyFormId, jobId) => {
      return await axiosInstance.get("/hr/offers/by-application", {
         params: { applyFormId, jobId },
      });
   },

   viewPdfAsHr: async (offerId) => {
      return await axiosInstance.get(`/hr/offers/${offerId}/pdf/view`);
   },

   // ─── Candidate ────────────────────────────────────────────────

   listMyOffers: async () => {
      return await axiosInstance.get("/candidates/offers");
   },

   getByIdAsCandidate: async (offerId) => {
      return await axiosInstance.get(`/candidates/offers/${offerId}`);
   },

   viewPdfAsCandidate: async (offerId) => {
      return await axiosInstance.get(`/candidates/offers/${offerId}/pdf/view`);
   },

   accept: async (offerId) => {
      return await axiosInstance.post(`/candidates/offers/${offerId}/accept`);
   },

   decline: async (offerId, reason) => {
      return await axiosInstance.post(`/candidates/offers/${offerId}/decline`,
         reason ? { reason } : {});
   },
};

export default offerService;
