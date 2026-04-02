package com.iting.jobportal.job.service;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.JobReviewHistory;
import com.iting.jobportal.job.entity.enums.JobReviewAction;
import com.iting.jobportal.job.repository.JobReviewHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class JobReviewHistoryServiceImpl implements JobReviewHistoryService {

    private final JobReviewHistoryRepository jobReviewHistoryRepository;

    public void log(Job job, JobReviewAction action, String actor, String note) {
        JobReviewHistory history = new JobReviewHistory();
        history.setJob(job);
        history.setAction(action);
        history.setActor(actor);
        history.setTimestamp(LocalDateTime.now());
        history.setNote(note);

        jobReviewHistoryRepository.save(history);
    }
}