package com.iting.jobportal.common.repository;

import com.iting.jobportal.common.entity.Referral;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferralRepository extends JpaRepository<Referral, Long> {

  List<Referral> findByReferrer_IdOrderBySignupAtDesc(Long referrerId);

  Optional<Referral> findByReferred_Id(Long referredAccountId);

  long countByReferrer_Id(Long referrerId);

  long countByReferrer_IdAndFirstApplicationAtIsNotNull(Long referrerId);
}
