package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByPaymentOrder_Id(Long paymentOrderId);
    List<Invoice> findByAccount_IdOrderByIssuedAtDesc(Long accountId);
}
