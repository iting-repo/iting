package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.Portfolio;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
  List<Portfolio> findByProfile_Id(Long profileId);
}
