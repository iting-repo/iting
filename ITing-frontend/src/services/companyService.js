import axiosInstance from "../utils/axiosInstance";
import affiliationService from "./affiliationService";

/**
 * Phase 5 (HR ↔ Company refactor) — migration status:
 *   * Jobs:        đã chuyển sang /hr/jobs/** (path mới Phase 4).
 *   * getMyCompany: resolve qua affiliation → /hr/companies/{id}.
 *   * Một số endpoint /companies/me/* còn legacy (consent doc, representative, verify-phone)
 *     vì chưa có HR-side equivalent — giữ nguyên, sẽ migrate khi backend bổ sung.
 *   * Snapshot info (HR sửa thông tin công ty) → dùng affiliationService trực tiếp,
 *     KHÔNG qua companyService nữa.
 */
const companyService = {
  /**
   * Lấy thông tin Company của HR đang login.
   * Resolve qua affiliation: /hr/affiliations/me → companyId → /hr/companies/{id}.
   * Trả về null nếu HR chưa init affiliation (chưa nhập taxCode lần đầu).
   */
  getMyCompany: async () => {
    const me = await affiliationService.getMe();
    if (!me || !me.companyId) {
      return null;
    }
    return await axiosInstance.get(`/hr/companies/${me.companyId}`);
  },

  /**
   * @deprecated Sửa Company info giờ qua affiliation snapshot (admin sẽ apply).
   *             Dùng affiliationService.updateBasicInfo thay vì endpoint này.
   */
  updateCompanyBasicInfo: async (id, companyData) => {
    return await axiosInstance.put(`/companies/${id}/basic-info`, companyData);
  },

  // ─── JOBS — đã migrate sang /hr/jobs/** (Phase 4) ─────────────────────

  createEmployerJob: async (jobData) => {
    return await axiosInstance.post("/hr/jobs", jobData);
  },

  updateEmployerJob: async (id, jobData) => {
    return await axiosInstance.put(`/hr/jobs/${id}`, jobData);
  },

  closeEmployerJob: async (id) => {
    return await axiosInstance.post(`/hr/jobs/${id}/close`);
  },

  reopenEmployerJob: async (id) => {
    return await axiosInstance.post(`/hr/jobs/${id}/reopen`);
  },

  deleteEmployerJob: async (id) => {
    return await axiosInstance.delete(`/hr/jobs/${id}`);
  },

  getMyJobs: async (page = 0, size = 10) => {
    return await axiosInstance.get(`/hr/jobs/my-jobs?page=${page}&size=${size}`);
  },

  // ─── BUSINESS LICENSE / LOGO ──────────────────────────────────────────

  /**
   * Presigned URL xem giấy phép kinh doanh hiện tại của Company (đã được admin duyệt).
   * Resolve qua affiliation → /hr/companies/{id}/business-license/view.
   */
  getBusinessLicensePresignedUrl: async (minutes = 30) => {
    const me = await affiliationService.getMe();
    if (!me || !me.companyId) {
      return null;
    }
    return await axiosInstance.get(`/hr/companies/${me.companyId}/business-license/view`, {
      params: { minutes },
    });
  },

  /**
   * @deprecated HR upload license vào snapshot affiliation, không phải Company trực tiếp.
   *             Dùng `affiliationService.uploadLicense(file)` thay vì endpoint này.
   */
  uploadBusinessLicense: async (file) => {
    return await affiliationService.uploadLicense(file);
  },

  /**
   * @deprecated Phase 6 (Option B): consent đã gộp vào affiliation snapshot.
   *             Dùng `affiliationService.uploadConsent(file, confirmed)` thay vì endpoint này.
   *             Wrapper này forward sang affiliation để code cũ không vỡ.
   */
  uploadConsentDocument: async (file, confirmed) => {
    return await affiliationService.uploadConsent(file, confirmed);
  },

  /**
   * @deprecated HR upload logo vào snapshot affiliation. Dùng `affiliationService.uploadLogo(file)`.
   */
  uploadCompanyLogo: async (file) => {
    return await affiliationService.uploadLogo(file);
  },

  // ─── SUBMIT REVIEW — gộp về 1 endpoint mới /hr/affiliations/me/submit-review ─

  /**
   * @deprecated Phase 5: gộp 4 submit endpoint cũ vào 1 endpoint mới của affiliation.
   *             Backend mới validate đủ name/email/phone/address/license trước khi accept.
   */
  submitInfoReview: async () => {
    return await affiliationService.submitReview();
  },

  /** @deprecated Dùng affiliationService.submitReview. */
  submitDocumentReview: async () => {
    return await affiliationService.submitReview();
  },

  /** @deprecated Dùng affiliationService.submitReview. */
  submitBusinessLicenseReview: async () => {
    return await affiliationService.submitReview();
  },

  /** @deprecated Phase 6: consent gộp vào affiliation, dùng affiliationService.submitReview. */
  submitConsentDocumentReview: async () => {
    return await affiliationService.submitReview();
  },

  /**
   * Presigned URL xem logo của HR đã upload (snapshot affiliation).
   */
  getLogoPresignedUrl: async () => {
    return await affiliationService.getLogoPresignedUrl();
  },

  // ─── PHONE VERIFICATION ───────────────────────────────────────────────

  sendPhoneOtp: async (phone) => {
    return await axiosInstance.post("/companies/me/send-phone-otp", { phone });
  },

  verifyPhone: async (phone, otpCode) => {
    return await axiosInstance.post("/companies/me/verify-phone", { phone, otpCode });
  },

  // ─── SOCIAL LINKS ─────────────────────────────────────────────────────

  getMySocialLinks: async () => {
    return await axiosInstance.get("/companies/me/social-links");
  },

  updateMySocialLinks: async (links) => {
    return await axiosInstance.put("/companies/me/social-links", links);
  },

  // ─── PUBLIC ───────────────────────────────────────────────────────────

  searchCompanies: async (params) => {
    return await axiosInstance.get("/public/companies", { params });
  },

  getCompanyDetail: async (id) => {
    return await axiosInstance.get(`/public/companies/${id}`);
  },

  // ─── FOLLOW (CANDIDATE side, không đổi) ───────────────────────────────

  followCompany: async (companyId) => {
    return await axiosInstance.post("/companies/follow", { companyId });
  },

  unfollowCompany: async (companyId) => {
    return await axiosInstance.delete(`/companies/follow/${companyId}`);
  },

  checkFollowing: async (companyId) => {
    return await axiosInstance.get(`/companies/follow/check/${companyId}`);
  },

  getMyFollowedCompanies: async (page = 0, size = 100) => {
    return await axiosInstance.get("/companies/follow/my-followed", {
      params: { page, size },
    });
  },

  // ─── REVIEWS ─────────────────────────────────────────────────────────

  getCompanyReviews: async (companyId) => {
    return await axiosInstance.get(`/public/companies/${companyId}/reviews`);
  },

  /**
   * @deprecated Backend chưa expose /rating-stats. Stats đã có sẵn trong response
   *             của getCompanyReviews (averageRating, totalReviews, recommendPercent).
   *             Wrapper này extract về shape cũ cho code chưa migrate.
   */
  getCompanyRatingStats: async (companyId) => {
    const r = await axiosInstance.get(`/public/companies/${companyId}/reviews`);
    return {
      averageRating: r?.averageRating || 0,
      reviewCount: r?.totalReviews || 0,
      recommendPercent: r?.recommendPercent || 0,
    };
  },

  postCompanyReview: async (companyId, reviewData) => {
    return await axiosInstance.post(`/candidate/companies/${companyId}/reviews`, reviewData);
  },
};

export default companyService;
