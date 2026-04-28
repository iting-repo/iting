package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByPositionOrderByPriorityDesc(String position);
    List<Banner> findByStatusOrderByPriorityDesc(String status);
}
