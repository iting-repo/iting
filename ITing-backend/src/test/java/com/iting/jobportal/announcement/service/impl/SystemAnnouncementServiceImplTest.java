package com.iting.jobportal.announcement.service.impl;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import com.iting.jobportal.announcement.entity.AnnouncementAck;
import com.iting.jobportal.announcement.entity.SystemAnnouncement;
import com.iting.jobportal.announcement.entity.enums.AnnouncementDisplayMode;
import com.iting.jobportal.announcement.repository.AnnouncementAckRepository;
import com.iting.jobportal.announcement.repository.SystemAnnouncementRepository;
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
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemAnnouncementServiceImplTest {

    @Mock private SystemAnnouncementRepository repo;
    @Mock private AnnouncementAckRepository ackRepo;
    @InjectMocks private SystemAnnouncementServiceImpl service;

    private SystemAnnouncement makeAnn(Long id, String roles, String routesJson) {
        return SystemAnnouncement.builder()
                .id(id)
                .title("T")
                .bodyHtml("B")
                .targetRoles(roles)
                .triggerRoutes(routesJson)
                .priority(1)
                .active(true)
                .build();
    }

    // ── getActiveForUser: null userId ───────────────────────────────────

    @Test
    void getActiveForUser_nullUserId_returnsEmpty() {
        List<AnnouncementDto> result = service.getActiveForUser(null, "CANDIDATE", "/");
        assertTrue(result.isEmpty());
        verify(repo, never()).findActiveForUser(any(), any());
    }

    // ── role filtering ──────────────────────────────────────────────────

    @Test
    void getActiveForUser_targetAll_matchesAnyRole() {
        SystemAnnouncement a = makeAnn(1L, "ALL", "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        List<AnnouncementDto> result = service.getActiveForUser(1L, "CANDIDATE", "/");
        assertEquals(1, result.size());
    }

    @Test
    void getActiveForUser_specificRoleMatch() {
        SystemAnnouncement a = makeAnn(1L, "CANDIDATE,EMPLOYER", "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "EMPLOYER", "/").size());
        assertEquals(1, service.getActiveForUser(1L, "candidate", "/").size(), "case-insensitive");
    }

    @Test
    void getActiveForUser_roleMismatch_filtered() {
        SystemAnnouncement a = makeAnn(1L, "ADMIN", "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertTrue(service.getActiveForUser(1L, "CANDIDATE", "/").isEmpty());
    }

    @Test
    void getActiveForUser_nullRoleField_treatedAsAll() {
        SystemAnnouncement a = makeAnn(1L, null, "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/").size());
    }

    @Test
    void getActiveForUser_userRoleNull_andSpecificTarget_filteredOut() {
        SystemAnnouncement a = makeAnn(1L, "CANDIDATE", "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertTrue(service.getActiveForUser(1L, null, "/").isEmpty());
    }

    // ── route matching: exact, glob, JSON array, single string ──────────

    @Test
    void getActiveForUser_exactRouteMatch() {
        SystemAnnouncement a = makeAnn(1L, "ALL", "[\"/jobs\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/jobs").size());
        assertTrue(service.getActiveForUser(1L, "CANDIDATE", "/other").isEmpty());
    }

    @Test
    void getActiveForUser_globRouteMatch() {
        SystemAnnouncement a = makeAnn(1L, "ALL", "[\"/jobs/*\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/jobs/123").size());
        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/jobs/abc/detail").size());
    }

    @Test
    void getActiveForUser_singleStringRoute_noJsonArray() {
        // Pattern stored as plain string (not JSON array)
        SystemAnnouncement a = makeAnn(1L, "ALL", "/login");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/login").size());
    }

    @Test
    void getActiveForUser_nullRouteField_matchesAny() {
        SystemAnnouncement a = makeAnn(1L, "ALL", null);
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/any").size());
    }

    @Test
    void getActiveForUser_emptyJsonArray_matchesNone() {
        SystemAnnouncement a = makeAnn(1L, "ALL", "[]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertTrue(service.getActiveForUser(1L, "CANDIDATE", "/").isEmpty());
    }

    @Test
    void getActiveForUser_currentRouteNull_defaultsToSlash() {
        SystemAnnouncement a = makeAnn(1L, "ALL", "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a));

        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", null).size());
    }

    @Test
    void getActiveForUser_returnsOnlyTopOne() {
        SystemAnnouncement a1 = makeAnn(1L, "ALL", "[\"/\"]");
        SystemAnnouncement a2 = makeAnn(2L, "ALL", "[\"/\"]");
        SystemAnnouncement a3 = makeAnn(3L, "ALL", "[\"/\"]");
        when(repo.findActiveForUser(eq(1L), any())).thenReturn(List.of(a1, a2, a3));

        // limit(1) — chỉ trả top 1
        assertEquals(1, service.getActiveForUser(1L, "CANDIDATE", "/").size());
    }

    // ── ack ─────────────────────────────────────────────────────────────

    @Test
    void ack_newAck_saves() {
        when(ackRepo.existsByUserIdAndAnnouncementId(1L, 5L)).thenReturn(false);
        when(repo.existsById(5L)).thenReturn(true);

        service.ack(1L, 5L);

        ArgumentCaptor<AnnouncementAck> cap = ArgumentCaptor.forClass(AnnouncementAck.class);
        verify(ackRepo).save(cap.capture());
        assertEquals(1L, cap.getValue().getUserId());
        assertEquals(5L, cap.getValue().getAnnouncementId());
        assertNotNull(cap.getValue().getAckedAt());
    }

    @Test
    void ack_alreadyAcked_idempotent_noSave() {
        when(ackRepo.existsByUserIdAndAnnouncementId(1L, 5L)).thenReturn(true);

        service.ack(1L, 5L);

        verify(ackRepo, never()).save(any());
        verify(repo, never()).existsById(any()); // exits early
    }

    @Test
    void ack_announcementNotFound_throws404() {
        when(ackRepo.existsByUserIdAndAnnouncementId(1L, 5L)).thenReturn(false);
        when(repo.existsById(5L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.ack(1L, 5L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(ackRepo, never()).save(any());
    }

    @Test
    void ack_nullUserId_throws401() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.ack(null, 5L));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // ── list ────────────────────────────────────────────────────────────

    @Test
    void list_paginated_mapsDto() {
        SystemAnnouncement a = makeAnn(1L, "ALL", "[\"/\"]");
        Page<SystemAnnouncement> page = new PageImpl<>(List.of(a));
        when(repo.findAllByOrderByPriorityDescIdDesc(any(Pageable.class))).thenReturn(page);

        Page<AnnouncementDto> result = service.list(org.springframework.data.domain.PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    // ── get ─────────────────────────────────────────────────────────────

    @Test
    void get_found_returnsDto() {
        SystemAnnouncement a = makeAnn(5L, "ALL", "[\"/\"]");
        when(repo.findById(5L)).thenReturn(Optional.of(a));

        AnnouncementDto dto = service.get(5L);
        assertEquals(5L, dto.getId());
    }

    @Test
    void get_notFound_throws404() {
        when(repo.findById(5L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.get(5L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    // ── create ──────────────────────────────────────────────────────────

    @Test
    void create_appliesDefaults() {
        AnnouncementDto input = new AnnouncementDto();
        input.setTitle("Title");
        input.setBodyHtml("<p>Body</p>");
        // Leave displayMode, priority, active, requireAcknowledge null

        when(repo.save(any(SystemAnnouncement.class))).thenAnswer(inv -> {
            SystemAnnouncement a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });

        AnnouncementDto result = service.create(input, 99L);

        ArgumentCaptor<SystemAnnouncement> cap = ArgumentCaptor.forClass(SystemAnnouncement.class);
        verify(repo).save(cap.capture());
        SystemAnnouncement saved = cap.getValue();
        assertEquals("Title", saved.getTitle());
        assertEquals(AnnouncementDisplayMode.MODAL_DISMISSIBLE, saved.getDisplayMode(),
                "Default displayMode");
        assertEquals("ALL", saved.getTargetRoles(), "Empty list → ALL fallback");
        assertEquals("[\"/\"]", saved.getTriggerRoutes(), "Empty list → default array");
        assertEquals(0, saved.getPriority());
        assertEquals(true, saved.getActive());
        assertEquals(false, saved.getRequireAcknowledge());
        assertEquals(99L, saved.getCreatedBy());
        assertNotNull(result);
    }

    @Test
    void create_withExplicitValues_preservesAll() {
        AnnouncementDto input = new AnnouncementDto();
        input.setTitle("X");
        input.setBodyHtml("Y");
        input.setDisplayMode(AnnouncementDisplayMode.BANNER);
        input.setPriority(10);
        input.setActive(false);
        input.setRequireAcknowledge(true);
        input.setTargetRoles(List.of("CANDIDATE", "EMPLOYER"));
        input.setTriggerRoutes(List.of("/jobs/*", "/companies/*"));
        input.setStartAt(LocalDateTime.of(2026, 5, 1, 0, 0));
        input.setEndAt(LocalDateTime.of(2026, 6, 1, 0, 0));

        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.create(input, 99L);

        ArgumentCaptor<SystemAnnouncement> cap = ArgumentCaptor.forClass(SystemAnnouncement.class);
        verify(repo).save(cap.capture());
        SystemAnnouncement saved = cap.getValue();
        assertEquals(AnnouncementDisplayMode.BANNER, saved.getDisplayMode());
        assertEquals(10, saved.getPriority());
        assertEquals(false, saved.getActive());
        assertEquals(true, saved.getRequireAcknowledge());
        assertEquals("CANDIDATE,EMPLOYER", saved.getTargetRoles());
        assertTrue(saved.getTriggerRoutes().contains("/jobs/*"));
        assertTrue(saved.getTriggerRoutes().contains("/companies/*"));
    }

    // ── update ──────────────────────────────────────────────────────────

    @Test
    void update_partialFields_onlyChangesProvided() {
        SystemAnnouncement existing = makeAnn(5L, "ALL", "[\"/\"]");
        existing.setTitle("Old");
        existing.setPriority(3);
        existing.setActive(true);
        when(repo.findById(5L)).thenReturn(Optional.of(existing));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AnnouncementDto patch = new AnnouncementDto();
        patch.setTitle("New");
        // priority/active không set → giữ nguyên

        service.update(5L, patch);

        assertEquals("New", existing.getTitle());
        assertEquals(3, existing.getPriority());
        assertEquals(true, existing.getActive());
    }

    @Test
    void update_notFound_throws404() {
        when(repo.findById(5L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.update(5L, new AnnouncementDto()));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    // ── delete ──────────────────────────────────────────────────────────

    @Test
    void delete_existing_callsRepo() {
        when(repo.existsById(5L)).thenReturn(true);

        service.delete(5L);

        verify(repo).deleteById(5L);
    }

    @Test
    void delete_notFound_throws404() {
        when(repo.existsById(5L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.delete(5L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(repo, never()).deleteById(any());
    }
}
