package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.request.InitAffiliationRequest;
import com.iting.jobportal.company.dto.request.UpdateAffiliationBasicInfoRequest;
import com.iting.jobportal.company.dto.response.AffiliationMeResponse;
import com.iting.jobportal.company.dto.response.InitAffiliationResponse;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

/**
 * HR-side service cho affiliation: * init: tạo Company DRAFT (nếu taxCode chưa có) hoặc join
 * Company existing. * getMe: trạng thái affiliation + snapshot. * updateBasicInfo / uploadLogo /
 * uploadLicense: update snapshot fields. * submitReview: gửi snapshot cho admin duyệt.
 */
public interface AffiliationService {

  /**
   * HR đầu tiên gọi qua FoundingInfoTab khi nhập taxCode. Idempotent: nếu HR đã có affiliation
   * active → trả 409.
   */
  InitAffiliationResponse init(Long hrAccountId, InitAffiliationRequest request);

  /** Trạng thái affiliation + snapshot của HR đang login. */
  Optional<AffiliationMeResponse> getMe(Long hrAccountId);

  /** Update các snapshot field (KHÔNG ghi vào Company). Reset submissionStatus = DRAFT. */
  AffiliationMeResponse updateBasicInfo(
      Long hrAccountId, UpdateAffiliationBasicInfoRequest request);

  /** Upload logo lên S3, set submitted_logo_url, trả URL. */
  String uploadLogo(Long hrAccountId, MultipartFile file);

  /** Upload license lên S3, set submitted_license_url, trả URL. */
  String uploadLicense(Long hrAccountId, MultipartFile file);

  /**
   * Upload consent document (thỏa thuận DLCN) lên S3, set submitted_consent_url + confirmed flag.
   */
  String uploadConsent(Long hrAccountId, MultipartFile file, boolean confirmed);

  /**
   * Gửi snapshot cho admin duyệt. Set submissionStatus=PENDING_REVIEW + status=PENDING (nếu lần
   * đầu).
   */
  AffiliationMeResponse submitReview(Long hrAccountId);

  /** Gửi RIÊNG phần thông tin công ty cho admin duyệt (info_status = PENDING_REVIEW). */
  AffiliationMeResponse submitInfo(Long hrAccountId);

  /** Gửi RIÊNG phần giấy phép kinh doanh cho admin duyệt (license_status = PENDING_REVIEW). */
  AffiliationMeResponse submitLicense(Long hrAccountId);

  /** Gửi RIÊNG phần thỏa thuận DLCN cho admin duyệt (consent_status = PENDING_REVIEW). */
  AffiliationMeResponse submitConsent(Long hrAccountId);

  /** Presigned URL self-check cho HR xem lại license đã upload. */
  String getLicensePresignedUrl(Long hrAccountId, int expiryMinutes);

  /** Presigned URL self-check cho HR xem lại logo đã upload. */
  String getLogoPresignedUrl(Long hrAccountId, int expiryMinutes);

  /** Presigned URL self-check cho HR xem lại consent document đã upload. */
  String getConsentPresignedUrl(Long hrAccountId, int expiryMinutes);
}
