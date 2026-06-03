package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.Education;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
  List<Education> findByProfile_Id(Long profileId);
}
