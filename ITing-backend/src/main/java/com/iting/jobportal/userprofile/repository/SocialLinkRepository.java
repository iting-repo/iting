package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.SocialLink;
import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    List<SocialLink> findByProfile_Id(Long profileId);
    Optional<SocialLink> findByProfileIdAndPlatform(Long profileId, SocialPlatform platform);
}