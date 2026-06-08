package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.HrSubscription;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface HrSubscriptionRepository extends JpaRepository<HrSubscription, Long> {

  Optional<HrSubscription> findFirstByAccount_IdAndStatusOrderByExpiresAtDesc(
      Long accountId, String status);

  /**
   * Toàn bộ subscription kèm Account (JOIN FETCH tránh N+1 khi admin liệt kê người đăng ký), mới
   * nhất trước. Công ty trực thuộc resolve riêng qua affiliation.
   */
  @Query("SELECT s FROM HrSubscription s JOIN FETCH s.account ORDER BY s.expiresAt DESC")
  List<HrSubscription> findAllWithAccount();

  List<HrSubscription> findByStatusAndAutoRenewAndExpiresAtBefore(
      String status, Boolean autoRenew, LocalDateTime cutoff);

  List<HrSubscription> findByAccount_IdOrderByCreatedAtDesc(Long accountId);

  /** Có HR nào đang/đã dùng tier code này không (để chặn xóa gói còn ràng buộc). */
  boolean existsByTier(String tier);
}
