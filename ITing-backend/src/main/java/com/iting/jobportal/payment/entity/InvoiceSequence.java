package com.iting.jobportal.payment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invoice_sequence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceSequence {

  @Id
  @Column(name = "year")
  private Integer year;

  @Column(name = "last_number", nullable = false)
  @Builder.Default
  private Integer lastNumber = 0;
}
