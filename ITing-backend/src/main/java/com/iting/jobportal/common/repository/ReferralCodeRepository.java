package com.iting.jobportal.common.repository;

import com.iting.jobportal.common.entity.ReferralCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReferralCodeRepository extends JpaRepository<ReferralCode, Long> {

    Optional<ReferralCode> findByCode(String code);

    Optional<ReferralCode> findByAccount_Id(Long accountId);

    boolean existsByCode(String code);
}
