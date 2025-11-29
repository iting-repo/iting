package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {

    List<SocialLink> findByUserId(Long userId);
}
