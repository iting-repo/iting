package com.iting.jobportal.employer.repository;

import com.iting.jobportal.employer.entity.Employer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, Long> {

    Optional<Employer> findByAccount_Id(Long accountId);

    boolean existsByAccount_Id(Long accountId);
}
