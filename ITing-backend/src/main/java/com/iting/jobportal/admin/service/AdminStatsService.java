package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.DetailedStatsDto;

public interface AdminStatsService {
    DetailedStatsDto getDetailedStats(String dateRange);
}
