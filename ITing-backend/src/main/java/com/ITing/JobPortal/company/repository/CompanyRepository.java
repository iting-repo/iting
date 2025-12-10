package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}