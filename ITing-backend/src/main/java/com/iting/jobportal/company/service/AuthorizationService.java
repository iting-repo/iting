package com.iting.jobportal.company.service;

import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Resolve companyId / affiliationId của HR đang login qua bảng affiliation.
 *
 * Thay thế cho pattern cũ {@code accountId == companyId} (do @MapsId).
 * Mọi service cũ giả định "current user id == company id" cần chuyển sang gọi
 * {@link #requireApprovedCompanyOf(Long)} hoặc {@link #requireCompanyOf(Long)}.
 */
@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final CompanyHrAffiliationRepository affiliationRepo;

    /**
     * Trả về companyId mà HR được phép đăng job / cập nhật snapshot.
     * Yêu cầu Affiliation.status = APPROVED và Company.active = true.
     *
     * @throws ResponseStatusException 403 nếu không thoả.
     */
    public Long requireApprovedCompanyOf(Long hrAccountId) {
        CompanyHrAffiliation aff = affiliationRepo
                .findByHrAccount_IdAndStatus(hrAccountId, AffiliationStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "HR chưa được duyệt thuộc công ty nào"));
        if (!Boolean.TRUE.equals(aff.getCompany().getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Công ty đang bị tạm ngưng — không thể thực hiện thao tác này");
        }
        return aff.getCompany().getId();
    }

    /**
     * Trả về companyId của HR (kể cả khi affiliation đang INCOMPLETE/PENDING).
     * Dùng cho xem profile, sửa snapshot, upload license — tức các thao tác
     * không yêu cầu HR đã hoàn tất xác minh.
     */
    public Long requireCompanyOf(Long hrAccountId) {
        return affiliationRepo
                .findActiveByHrAccountId(hrAccountId)
                .map(a -> a.getCompany().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "HR chưa khởi tạo affiliation"));
    }

    /**
     * Trả về affiliation đang active của HR (entity, không chỉ id).
     * Dùng cho mọi endpoint /api/hr/affiliations/me/...
     */
    public CompanyHrAffiliation requireAffiliationOf(Long hrAccountId) {
        return affiliationRepo
                .findActiveByHrAccountId(hrAccountId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "HR chưa khởi tạo affiliation"));
    }
}
