package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.InvoiceSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InvoiceSequenceRepository extends JpaRepository<InvoiceSequence, Integer> {
    /** Pessimistic lock so concurrent invoice creations don't issue duplicate numbers. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from InvoiceSequence s where s.year = :year")
    Optional<InvoiceSequence> findByYearForUpdate(Integer year);
}
