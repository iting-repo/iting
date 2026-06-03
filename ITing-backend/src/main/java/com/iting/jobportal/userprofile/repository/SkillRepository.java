package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.Skill;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
  List<Skill> findByProfile_Id(Long profileId);
}
