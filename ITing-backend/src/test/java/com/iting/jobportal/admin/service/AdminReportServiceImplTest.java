package com.iting.jobportal.admin.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.repository.UserReportRepository;
import com.iting.jobportal.admin.service.impl.AdminReportServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceImplTest {

  @Mock private UserReportRepository reportRepository;

  @InjectMocks private AdminReportServiceImpl service;

  @Test
  void getReports_shouldReturnRepositoryPageWithCorrectPageable() {
    Page<UserReport> page = new PageImpl<>(List.of(new UserReport()));
    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

    when(reportRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

    Page<UserReport> result = service.getReports("OPEN", null, null, null, null, 0, 10);

    assertSame(page, result);
    verify(reportRepository).findAll(any(Specification.class), pageableCaptor.capture());
    assertEquals(0, pageableCaptor.getValue().getPageNumber());
    assertEquals(10, pageableCaptor.getValue().getPageSize());
  }

  @Test
  void getReports_shouldIgnoreStatusInCurrentImplementation() {
    Page<UserReport> page = new PageImpl<>(List.of(new UserReport()));
    when(reportRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

    Page<UserReport> result = service.getReports("RESOLVED", null, null, null, null, 1, 5);

    assertSame(page, result);
    verify(reportRepository).findAll(any(Specification.class), any(Pageable.class));
  }

  @Test
  void handleReport_shouldUpdateStatusAndSave() {
    UserReport report = new UserReport();
    report.setStatus("OPEN");

    when(reportRepository.findById(2L)).thenReturn(Optional.of(report));
    when(reportRepository.save(report)).thenReturn(report);

    UserReport result = service.handleReport(1L, 2L, "RESOLVED", "done");

    assertSame(report, result);
    assertEquals("RESOLVED", report.getStatus());
    verify(reportRepository).findById(2L);
    verify(reportRepository).save(report);
  }

  @Test
  void handleReport_shouldUseProvidedStatusEvenThoughAdminIdAndNoteAreIgnored() {
    UserReport report = new UserReport();
    report.setStatus("OPEN");

    when(reportRepository.findById(2L)).thenReturn(Optional.of(report));
    when(reportRepository.save(report)).thenReturn(report);

    UserReport result = service.handleReport(99L, 2L, "REJECTED", "any note");

    assertSame(report, result);
    assertEquals("REJECTED", result.getStatus());
    verify(reportRepository).save(report);
  }

  @Test
  void handleReport_whenReportNotFound_shouldThrowAndNotSave() {
    when(reportRepository.findById(2L)).thenReturn(Optional.empty());

    RuntimeException ex =
        assertThrows(
            RuntimeException.class, () -> service.handleReport(1L, 2L, "RESOLVED", "done"));

    assertEquals("Report not found", ex.getMessage());
    verify(reportRepository).findById(2L);
    verify(reportRepository, never()).save(any());
  }
}
