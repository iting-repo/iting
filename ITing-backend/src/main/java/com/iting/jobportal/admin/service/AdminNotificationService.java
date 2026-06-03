package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;

public interface AdminNotificationService {
  void notifyNewCompany(Company company);

  void notifyNewJob(Job job);

  void notifyUserReport(UserReport report);
}
