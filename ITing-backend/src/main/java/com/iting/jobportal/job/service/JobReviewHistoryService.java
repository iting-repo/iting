package com.iting.jobportal.job.service;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobReviewAction;

public interface JobReviewHistoryService {
  public void log(Job job, JobReviewAction action, String actor, String note);
}
