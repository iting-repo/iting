package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.request.CreateOfferRequest;
import com.iting.jobportal.application.dto.request.DeclineOfferRequest;
import com.iting.jobportal.application.dto.response.OfferResponse;

import java.util.List;

public interface OfferService {

    /** HR tạo + gửi offer cho 1 application. Tự generate PDF + send email + in-app notification. */
    OfferResponse create(Long hrAccountId, CreateOfferRequest request);

    /** HR thu hồi offer (chỉ owner hoặc admin company). */
    OfferResponse revoke(Long hrAccountId, Long offerId);

    /** Candidate accept offer → application pipeline tự move HIRED. */
    OfferResponse acceptByCandidate(Long candidateAccountId, Long offerId);

    /** Candidate decline offer (có lý do tuỳ chọn). */
    OfferResponse declineByCandidate(Long candidateAccountId, Long offerId, DeclineOfferRequest body);

    /** List offer của 1 application (HR view). */
    List<OfferResponse> listByApplication(Long hrAccountId, Long applyFormId, Long jobId);

    /** List offer của candidate đang login. */
    List<OfferResponse> listMyOffers(Long candidateAccountId);

    /** Single offer detail — auth check trong impl (HR owner / admin / candidate). */
    OfferResponse getById(Long accountId, Long offerId, boolean asHr);

    /** Presigned URL xem PDF (15 phút). */
    String getPdfPresignedUrl(Long accountId, Long offerId, boolean asHr);

    /** Quét + đánh dấu EXPIRED — gọi qua scheduled job. Trả về số offer chuyển trạng thái. */
    int expireOverdueOffers();
}
