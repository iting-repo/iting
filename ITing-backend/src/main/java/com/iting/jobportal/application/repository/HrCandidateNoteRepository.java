package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.HrCandidateNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HrCandidateNoteRepository extends JpaRepository<HrCandidateNote, Long> {

    Optional<HrCandidateNote> findByHrAccountIdAndApplicationId(Long hrAccountId, Long applicationId);
}
