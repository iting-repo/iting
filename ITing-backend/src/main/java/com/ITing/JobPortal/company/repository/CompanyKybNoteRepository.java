package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyKybNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyKybNoteRepository extends JpaRepository<CompanyKybNote, Long> {
    List<CompanyKybNote> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}
