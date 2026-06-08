package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Banner;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
  List<Banner> findByPositionOrderByPriorityDesc(String position);

  List<Banner> findByStatusOrderByPriorityDesc(String status);

  long countByPositionAndStatus(String position, String status);

  long countByPositionAndStatusAndIdNot(String position, String status, Long id);

  long countByBannerTypeAndStatus(String bannerType, String status);

  long countByBannerTypeAndStatusAndIdNot(String bannerType, String status, Long id);

  List<Banner> findByBannerTypeAndStatusOrderByPriorityDesc(String bannerType, String status);
}
