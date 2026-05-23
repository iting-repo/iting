package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.OfferLetter;
import com.iting.jobportal.application.entity.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {

    /** Offer SENT đang active cho cặp (apply_form, job). Tối đa 1 theo unique partial index. */
    Optional<OfferLetter> findFirstByApplyFormIdAndJobIdAndStatus(
            Long applyFormId, Long jobId, OfferStatus status);

    List<OfferLetter> findByApplyFormIdAndJobIdOrderByCreatedAtDesc(Long applyFormId, Long jobId);

    List<OfferLetter> findByCandidateAccountIdOrderByCreatedAtDesc(Long candidateAccountId);

    List<OfferLetter> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    /** Quét offer SENT đã quá hạn — dùng cho scheduled expirer. */
    List<OfferLetter> findByStatusAndExpiresAtBefore(OfferStatus status, LocalDateTime threshold);
}
