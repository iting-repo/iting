package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.PaymentOrder;
import com.iting.jobportal.payment.entity.PaymentStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

  Optional<PaymentOrder> findByOrderCode(String orderCode);

  /** All orders of a user (newest first). */
  List<PaymentOrder> findByAccount_IdOrderByCreatedAtDesc(Long accountId);

  /** Used by expiry sweeper. */
  List<PaymentOrder> findByStatusAndExpiresAtBefore(PaymentStatus status, LocalDateTime cutoff);
}
