package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyKybNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyKybNoteRepository extends JpaRepository<CompanyKybNote, Long> {
  List<CompanyKybNote> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}
