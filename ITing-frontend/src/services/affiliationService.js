import axiosInstance from "../utils/axiosInstance";

/**
 * Affiliation service — wrap 8 endpoint mới của Phase 3 (HR ↔ Company refactor).
 *
 * Lifecycle:
 *   1. HR đăng ký EMPLOYER xong → call init({ taxCode }) lần đầu vào FoundingInfoTab.
 *   2. updateBasicInfo() ghi vào snapshot affiliation (KHÔNG ghi vào Company).
 *   3. uploadLogo() / uploadLicense() set submitted_logo_url / submitted_license_url.
 *   4. submitReview() gửi cho admin duyệt.
 *   5. Sau khi admin approve lần đầu → snapshot tự động apply lên Company → public.
 *   6. Muốn đổi info Company sau này → re-submit + gọi tổng đài.
 */
const affiliationService = {
  /**
   * Khởi tạo affiliation: tạo Company DRAFT (nếu taxCode chưa tồn tại) hoặc join Company existing.
   * @param {string} taxCode
   * @returns {Promise<{ companyId: number, affiliationId: number, isFirstHr: boolean, companyName: string }>}
   * @throws 409 nếu HR đã có affiliation active.
   */
  init: async (taxCode) => {
    return await axiosInstance.post("/hr/affiliations/me/init", { taxCode });
  },

  /**
   * Trạng thái + snapshot affiliation của HR đang login.
   * @returns {Promise<AffiliationMeResponse | null>} null nếu chưa init (backend trả 204).
   */
  getMe: async () => {
    const res = await axiosInstance.get("/hr/affiliations/me");
    // Backend trả 204 No Content khi HR chưa init → axios resolve với undefined
    return res || null;
  },

  /**
   * Cập nhật snapshot fields. KHÔNG ghi vào Company.
   * @param {Object} payload {name, logoUrl, description, website, address, industries, companySize, phone, companyEmail}
   */
  updateBasicInfo: async (payload) => {
    return await axiosInstance.put("/hr/affiliations/me/basic-info", payload);
  },

  /**
   * Upload logo vào snapshot affiliation.
   * @returns {Promise<{ url: string }>}
   */
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosInstance.post("/hr/affiliations/me/logo/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Upload giấy phép kinh doanh vào snapshot affiliation.
   * @returns {Promise<{ url: string }>}
   */
  uploadLicense: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosInstance.post("/hr/affiliations/me/license/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Gửi snapshot cho admin duyệt. Set submissionStatus=PENDING_REVIEW.
   * Lần đầu (status=INCOMPLETE/REJECTED) → status=PENDING.
   */
  submitReview: async () => {
    return await axiosInstance.post("/hr/affiliations/me/submit-review");
  },

  /**
   * Presigned URL self-check cho HR xem lại license đã upload (15 phút).
   */
  getLicensePresignedUrl: async () => {
    return await axiosInstance.get("/hr/affiliations/me/license/view");
  },

  /**
   * Presigned URL self-check cho HR xem lại logo đã upload (15 phút).
   */
  getLogoPresignedUrl: async () => {
    return await axiosInstance.get("/hr/affiliations/me/logo/view");
  },
};

export default affiliationService;
