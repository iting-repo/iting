package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.PaymentOrder;
import com.iting.jobportal.payment.entity.PaymentStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

  Optional<PaymentOrder> findByOrderCode(String orderCode);

  /** All orders of a user (newest first). */
  List<PaymentOrder> findByAccount_IdOrderByCreatedAtDesc(Long accountId);

  /** Used by expiry sweeper. */
  List<PaymentOrder> findByStatusAndExpiresAtBefore(PaymentStatus status, LocalDateTime cutoff);

  /**
   * Đếm số boost order PAID đã được activate trong cửa sổ thời gian — dùng cho monthly quota.
   * Quota tính theo successful purchases (activated_at IS NOT NULL), không tính pending/failed
   * vì user có thể tạo nhiều order rồi không pay.
   */
  @Query(
      "SELECT COUNT(po) FROM PaymentOrder po WHERE po.account.id = :accountId "
          + "AND po.itemType = :itemType AND po.status = 'PAID' AND po.activatedAt >= :since")
  long countActivatedByAccountAndItemTypeSince(
      @Param("accountId") Long accountId,
      @Param("itemType") String itemType,
      @Param("since") LocalDateTime since);
}
