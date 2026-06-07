import axiosInstance from '../utils/axiosInstance';

/**
 * Admin-side review affiliation (Phase 5/6 HR ↔ Company refactor).
 *
 * HR submit hồ sơ (thông tin + giấy phép + thỏa thuận DLCN) vào affiliation snapshot,
 * KHÔNG ghi thẳng vào Company. Admin duyệt qua các endpoint dưới đây; khi approve lần
 * đầu, backend tự apply snapshot lên Company (xem AdminAffiliationServiceImpl).
 *
 * Vì vậy đây là nguồn dữ liệu đúng để admin xem giấy tờ HR đã nộp (Company entity chỉ
 * có dữ liệu SAU khi đã duyệt).
 */
const adminAffiliationService = {
  /**
   * List affiliation + filter.
   * @param {Object} params {status, submissionStatus, companyId, hrAccountId, hrEmail, page, size, sort}
   * @returns {Promise<{content: AdminAffiliationResponse[], totalElements, totalPages, ...}>}
   */
  list: async (params = {}) => {
    return await axiosInstance.get('/admin/affiliations', { params });
  },

  /**
   * Affiliation mới nhất của 1 công ty (ưu tiên submission đang chờ duyệt).
   * Tiện cho màn Company detail: tìm hồ sơ HR đã nộp để admin đối chiếu/duyệt.
   * @returns {Promise<AdminAffiliationResponse | null>}
   */
  getLatestByCompany: async (companyId) => {
    const res = await axiosInstance.get('/admin/affiliations', {
      params: { companyId, page: 0, size: 20, sort: 'id,desc' },
    });
    const list = res?.content || [];
    // Ưu tiên hồ sơ đang chờ duyệt; nếu không có thì lấy bản mới nhất (id desc).
    return list.find((a) => a.submissionStatus === 'PENDING_REVIEW') || list[0] || null;
  },

  /** Chi tiết affiliation: HR + Company hiện tại + snapshot HR + presigned preview URL. */
  getDetail: async (affiliationId) => {
    return await axiosInstance.get(`/admin/affiliations/${affiliationId}`);
  },

  /** Presigned URL xem giấy phép HR đã submit (mặc định 15 phút). */
  getLicenseViewUrl: async (affiliationId) => {
    return await axiosInstance.get(`/admin/affiliations/${affiliationId}/license/view`);
  },

  /** Presigned URL xem văn bản thỏa thuận DLCN HR đã submit. */
  getConsentViewUrl: async (affiliationId) => {
    return await axiosInstance.get(`/admin/affiliations/${affiliationId}/consent/view`);
  },

  /**
   * Duyệt submission. Auto-apply snapshot lên Company nếu là affiliation đầu tiên APPROVED.
   * Yêu cầu submissionStatus = PENDING_REVIEW.
   */
  approve: async (affiliationId) => {
    return await axiosInstance.post(`/admin/affiliations/${affiliationId}/approve`);
  },

  /** Reject submission. Lần đầu (PENDING) → membership cũng REJECTED. */
  reject: async (affiliationId, reason) => {
    return await axiosInstance.post(`/admin/affiliations/${affiliationId}/reject`, { reason });
  },

  /** Duyệt RIÊNG 1 phần (part = info|license|consent). */
  approvePart: async (affiliationId, part) => {
    return await axiosInstance.post(`/admin/affiliations/${affiliationId}/parts/${part}/approve`);
  },

  /** Từ chối RIÊNG 1 phần (part = info|license|consent) + lý do. */
  rejectPart: async (affiliationId, part, reason) => {
    return await axiosInstance.post(`/admin/affiliations/${affiliationId}/parts/${part}/reject`, {
      reason,
    });
  },

  /** Gán HR vào công ty được chọn (ghi đè). Yêu cầu cả 3 phần đã APPROVED. */
  assignCompany: async (affiliationId, companyId) => {
    return await axiosInstance.post(`/admin/affiliations/${affiliationId}/assign-company`, {
      companyId,
    });
  },

  /** Thu hồi membership sau khi đã APPROVED. */
  revoke: async (affiliationId, reason) => {
    return await axiosInstance.post(`/admin/affiliations/${affiliationId}/revoke`, { reason });
  },
};

export default adminAffiliationService;
