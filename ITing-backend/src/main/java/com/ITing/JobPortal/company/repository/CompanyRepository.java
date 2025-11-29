package com.ITing.JobPortal.company.repository;

import com.ITing.JobPortal.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}