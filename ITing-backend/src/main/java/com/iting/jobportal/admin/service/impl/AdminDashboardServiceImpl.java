package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    @Override
    public DashboardStats getDashboardStats() {
        return DashboardStats.builder().build();
    }
}