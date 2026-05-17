package com.iting.jobportal.payment.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id", nullable = false, unique = true)
    private PaymentOrder paymentOrder;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 30)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "bill_to_name", nullable = false, length = 255)
    private String billToName;

    @Column(name = "bill_to_tax_code", length = 20)
    private String billToTaxCode;

    @Column(name = "bill_to_address", length = 500)
    private String billToAddress;

    @Column(name = "bill_to_email", length = 255)
    private String billToEmail;

    @Column(name = "amount_excl_vat", nullable = false)
    private Long amountExclVat;

    @Column(name = "vat_rate", nullable = false)
    @Builder.Default
    private Integer vatRate = 10;

    @Column(name = "vat_amount", nullable = false)
    private Long vatAmount;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "item_description", nullable = false, length = 255)
    private String itemDescription;

    @Column(name = "pdf_s3_url", length = 500)
    private String pdfS3Url;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (issuedAt == null) issuedAt = now;
    }
}
