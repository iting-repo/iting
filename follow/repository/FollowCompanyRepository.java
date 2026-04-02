package com.iting.jobportal.follow.repository;

import com.iting.jobportal.follow.entity.FollowCompany;
import com.iting.jobportal.follow.entity.FollowCompanyId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowCompanyRepository extends JpaRepository<FollowCompany, FollowCompanyId> {
}