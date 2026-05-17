package com.iting.jobportal.employer.repository;

import com.iting.jobportal.employer.entity.EmployerRequest;
import com.iting.jobportal.employer.entity.enums.EmployerRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployerRequestRepository extends JpaRepository<EmployerRequest, Long> {

    Page<EmployerRequest> findByStatus(EmployerRequestStatus status, Pageable pageable);

    List<EmployerRequest> findByEmployer_Id(Long employerId);

    Optional<EmployerRequest> findByEmployer_IdAndStatus(Long employerId, EmployerRequestStatus status);

    boolean existsByEmployer_IdAndStatus(Long employerId, EmployerRequestStatus status);
}
