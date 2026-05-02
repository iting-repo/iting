package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.ReportAccount;
import com.iting.jobportal.admin.entity.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportAccountRepository extends JpaRepository<ReportAccount, Long> {
    List<ReportAccount> findByStatus(ReportStatus status);

    long countByStatus(ReportStatus status);
}
