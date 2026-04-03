package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.service.impl.AdminDashboardServiceImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class AdminDashboardServiceImplTest {

    private final AdminDashboardServiceImpl service = new AdminDashboardServiceImpl();

    @Test
    void getDashboardStats_shouldReturnEmptyStatsObject() {
        DashboardStats stats = service.getDashboardStats();

        assertNotNull(stats);
    }
}
