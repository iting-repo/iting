package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.Certificate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
  List<Certificate> findByProfile_Id(Long profileId);
}
