package com.iting.jobportal.payment.service;

import com.iting.jobportal.payment.entity.CreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Quản lý credit balance + audit log. Balance hiện tại lưu trong {@code account.credits}; mọi thay
 * đổi đi qua đây để insert vào {@code credit_transaction} song song với update balance.
 */
public interface CreditService {

  /** Đọc balance hiện tại (không khoá). */
  int getBalance(Long accountId);

  /**
   * Cộng credit. {@code amount} phải > 0.
   *
   * @return giao dịch đã ghi.
   */
  CreditTransaction grant(
      Long accountId, int amount, String source, Long referenceId, String description);

  /**
   * Trừ credit. {@code amount} phải > 0. Throws {@link InsufficientCreditException} nếu balance
   * không đủ.
   */
  CreditTransaction consume(
      Long accountId, int amount, String source, Long referenceId, String description);

  Page<CreditTransaction> getHistory(Long accountId, Pageable pageable);

  class InsufficientCreditException extends RuntimeException {
    public InsufficientCreditException(String message) {
      super(message);
    }
  }
}
