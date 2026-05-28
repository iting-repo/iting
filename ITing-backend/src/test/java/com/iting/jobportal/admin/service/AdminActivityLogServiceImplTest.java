package com.iting.jobportal.admin.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.ActivityLog;
import com.iting.jobportal.admin.repository.ActivityLogRepository;
import com.iting.jobportal.admin.service.impl.AdminActivityLogServiceImpl;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class AdminActivityLogServiceImplTest {

  @Mock private ActivityLogRepository activityLogRepository;

  @InjectMocks private AdminActivityLogServiceImpl service;

  @Test
  void logActivity_shouldPersistConstructedLog() {
    service.logActivity(1L, "UPDATE", "JOB", 5L, "updated job");

    ArgumentCaptor<ActivityLog> captor = ArgumentCaptor.forClass(ActivityLog.class);
    verify(activityLogRepository).save(captor.capture());
    assertEquals(1L, captor.getValue().getUserId());
    assertEquals("UPDATE", captor.getValue().getAction());
    assertEquals("JOB", captor.getValue().getEntityType());
    assertEquals(5L, captor.getValue().getEntityId());
  }

  @Test
  void getActivityLogs_shouldDelegateToRepositoryWithCorrectPageable() {
    Page<ActivityLog> page = new PageImpl<>(List.of(ActivityLog.builder().action("A").build()));
    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

    when(activityLogRepository.findByUserIdOrderByCreatedAtDesc(
            any(Long.class), any(Pageable.class)))
        .thenReturn(page);

    Page<ActivityLog> result = service.getActivityLogs(1L, "A", 0, 10);

    verify(activityLogRepository)
        .findByUserIdOrderByCreatedAtDesc(any(Long.class), pageableCaptor.capture());
    assertEquals(0, pageableCaptor.getValue().getPageNumber());
    assertEquals(10, pageableCaptor.getValue().getPageSize());
    assertSame(page, result);
  }
}
