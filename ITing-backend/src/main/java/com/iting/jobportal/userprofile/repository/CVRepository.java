package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.CV;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
    List<CV> findByProfile_Id(Long profileId);

    @Query("SELECT c FROM CV c WHERE c.profile.id = :profileId ORDER BY c.uploadedAt DESC")
    List<CV> findTop3ByProfileIdOrderByUploadedAtDesc(@Param("profileId") Long profileId, Pageable pageable);

    long countByProfile_Id(Long profileId);

    CV findFirstByProfile_IdOrderByUploadedAtAsc(Long profileId);
}
