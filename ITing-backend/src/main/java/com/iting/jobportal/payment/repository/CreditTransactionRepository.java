package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.CreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

  Page<CreditTransaction> findByAccount_IdOrderByCreatedAtDesc(Long accountId, Pageable pageable);
}
