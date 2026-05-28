package com.iting.jobportal.announcement.controller;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import com.iting.jobportal.announcement.service.SystemAnnouncementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAnnouncementControllerTest {

    @Mock private SystemAnnouncementService service;
    @InjectMocks private AdminAnnouncementController controller;

    @Test
    void list_clampsSizeAbove100() {
        when(service.list(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(0, 9999);

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        verify(service).list(cap.capture());
        assertEquals(100, cap.getValue().getPageSize(), "size > 100 phải clamp xuống 100");
    }

    @Test
    void list_clampsSizeBelow1() {
        when(service.list(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(0, 0);

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        verify(service).list(cap.capture());
        assertEquals(1, cap.getValue().getPageSize(), "size < 1 phải clamp lên 1");
    }

    @Test
    void list_negativePage_clampedToZero() {
        when(service.list(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(-5, 20);

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        verify(service).list(cap.capture());
        assertEquals(0, cap.getValue().getPageNumber());
    }

    @Test
    void list_validParams_passThrough() {
        Page<AnnouncementDto> page = new PageImpl<>(List.of());
        when(service.list(org.mockito.ArgumentMatchers.any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<AnnouncementDto>> resp = controller.list(2, 50);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void get_delegatesToService() {
        AnnouncementDto dto = new AnnouncementDto();
        when(service.get(5L)).thenReturn(dto);

        assertSame(dto, controller.get(5L).getBody());
    }

    @Test
    void create_passesAdminId() {
        AnnouncementDto input = new AnnouncementDto();
        AnnouncementDto created = new AnnouncementDto();
        when(service.create(input, 99L)).thenReturn(created);

        assertSame(created, controller.create(99L, input).getBody());
    }

    @Test
    void update_delegatesToService() {
        AnnouncementDto input = new AnnouncementDto();
        AnnouncementDto updated = new AnnouncementDto();
        when(service.update(5L, input)).thenReturn(updated);

        assertSame(updated, controller.update(5L, input).getBody());
    }

    @Test
    void delete_callsService_returns204() {
        ResponseEntity<?> resp = controller.delete(5L);

        verify(service).delete(5L);
        assertEquals(HttpStatus.NO_CONTENT, resp.getStatusCode());
    }
}
