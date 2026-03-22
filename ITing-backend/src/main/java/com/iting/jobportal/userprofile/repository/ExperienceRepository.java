package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
//    List<Experience> findByUserId(Long userId);
    List<Experience> findByProfile_Id(Long profileId);
}

