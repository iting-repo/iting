package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.SocialLink;
import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
  List<SocialLink> findByProfile_Id(Long profileId);

  Optional<SocialLink> findByProfileIdAndPlatform(Long profileId, SocialPlatform platform);
}
