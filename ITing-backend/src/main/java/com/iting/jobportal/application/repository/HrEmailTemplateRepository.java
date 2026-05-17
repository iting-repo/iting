package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.HrEmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HrEmailTemplateRepository extends JpaRepository<HrEmailTemplate, Long> {
    /** Templates available to a specific company: company-specific + system defaults. */
    List<HrEmailTemplate> findByCompanyIdOrCompanyIdIsNullOrderByTemplateTypeAsc(Long companyId);

    Optional<HrEmailTemplate> findFirstByTemplateTypeAndIsDefault(String templateType, Boolean isDefault);
}
