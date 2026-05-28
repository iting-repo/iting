package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.response.HrReportResponse;
import com.iting.jobportal.application.service.HrReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrReportControllerTest {

    @Mock private HrReportService hrReportService;
    @InjectMocks private HrReportController controller;

    @Test
    void getOverview_withExplicitRange_passesThrough() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 5, 1);
        HrReportResponse expected = new HrReportResponse();
        when(hrReportService.buildOverview(1L, from, to)).thenReturn(expected);

        ResponseEntity<HrReportResponse> resp = controller.getOverview(1L, from, to);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(expected, resp.getBody());
    }

    @Test
    void getOverview_nullDates_defaults365Days() {
        when(hrReportService.buildOverview(any(), any(), any())).thenReturn(new HrReportResponse());

        controller.getOverview(1L, null, null);

        ArgumentCaptor<LocalDate> fromCap = ArgumentCaptor.forClass(LocalDate.class);
        ArgumentCaptor<LocalDate> toCap = ArgumentCaptor.forClass(LocalDate.class);
        verify(hrReportService).buildOverview(eq(1L), fromCap.capture(), toCap.capture());

        LocalDate today = LocalDate.now();
        assertEquals(today, toCap.getValue());
        assertEquals(today.minusDays(365), fromCap.getValue());
    }

    @Test
    void getOverview_onlyToProvided_fromDefaults365BeforeTo() {
        LocalDate to = LocalDate.of(2026, 5, 1);
        when(hrReportService.buildOverview(any(), any(), any())).thenReturn(new HrReportResponse());

        controller.getOverview(1L, null, to);

        ArgumentCaptor<LocalDate> fromCap = ArgumentCaptor.forClass(LocalDate.class);
        verify(hrReportService).buildOverview(eq(1L), fromCap.capture(), eq(to));
        assertEquals(to.minusDays(365), fromCap.getValue());
    }

    @Test
    void getOverview_onlyFromProvided_toDefaultsToToday() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        when(hrReportService.buildOverview(any(), any(), any())).thenReturn(new HrReportResponse());

        controller.getOverview(1L, from, null);

        ArgumentCaptor<LocalDate> toCap = ArgumentCaptor.forClass(LocalDate.class);
        verify(hrReportService).buildOverview(eq(1L), eq(from), toCap.capture());
        assertEquals(LocalDate.now(), toCap.getValue());
    }

    @Test
    void getOverview_swappedRange_fromAfterTo_isSwapped() {
        // User mistake: from > to → controller phải tự swap
        LocalDate later = LocalDate.of(2026, 6, 1);
        LocalDate earlier = LocalDate.of(2026, 1, 1);
        when(hrReportService.buildOverview(any(), any(), any())).thenReturn(new HrReportResponse());

        controller.getOverview(1L, later, earlier);

        ArgumentCaptor<LocalDate> fromCap = ArgumentCaptor.forClass(LocalDate.class);
        ArgumentCaptor<LocalDate> toCap = ArgumentCaptor.forClass(LocalDate.class);
        verify(hrReportService).buildOverview(eq(1L), fromCap.capture(), toCap.capture());

        assertTrue(fromCap.getValue().isBefore(toCap.getValue()) || fromCap.getValue().equals(toCap.getValue()),
                "Sau khi swap, from phải ≤ to");
        assertEquals(earlier, fromCap.getValue());
        assertEquals(later, toCap.getValue());
    }
}
