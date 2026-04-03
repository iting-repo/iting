package com.iting.jobportal.job;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.JobReviewHistory;
import com.iting.jobportal.job.entity.enums.JobReviewAction;
import com.iting.jobportal.job.repository.JobReviewHistoryRepository;
import com.iting.jobportal.job.service.JobReviewHistoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class JobReviewHistoryServiceImplTest {

    @Mock
    private JobReviewHistoryRepository jobReviewHistoryRepository;

    @InjectMocks
    private JobReviewHistoryServiceImpl service;

    @Test
    void log_shouldPersistHistoryWithProvidedFields() {
        Job job = new Job();
        job.setId(5L);

        service.log(job, JobReviewAction.APPROVED, "admin@test.com", "ok");

        ArgumentCaptor<JobReviewHistory> captor = ArgumentCaptor.forClass(JobReviewHistory.class);
        verify(jobReviewHistoryRepository).save(captor.capture());
        assertEquals(job, captor.getValue().getJob());
        assertEquals(JobReviewAction.APPROVED, captor.getValue().getAction());
        assertEquals("admin@test.com", captor.getValue().getActor());
        assertEquals("ok", captor.getValue().getNote());
        assertNotNull(captor.getValue().getTimestamp());
    }
}
