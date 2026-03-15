package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByProfileId(Long profileId);
}

