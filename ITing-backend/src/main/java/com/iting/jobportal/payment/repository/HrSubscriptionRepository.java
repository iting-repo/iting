package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.HrSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HrSubscriptionRepository extends JpaRepository<HrSubscription, Long> {

    Optional<HrSubscription> findFirstByAccount_IdAndStatusOrderByExpiresAtDesc(
            Long accountId, String status);

    List<HrSubscription> findByStatusAndAutoRenewAndExpiresAtBefore(
            String status, Boolean autoRenew, LocalDateTime cutoff);

    List<HrSubscription> findByAccount_IdOrderByCreatedAtDesc(Long accountId);
}
