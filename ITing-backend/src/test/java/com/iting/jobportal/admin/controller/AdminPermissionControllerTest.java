package com.iting.jobportal.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.admin.service.AdminPermissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminPermissionControllerTest {

    @Mock  AdminPermissionService adminPermissionService;
    @InjectMocks AdminPermissionController controller;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // ── GET overrides ─────────────────────────────────────────────

    @Test
    void getOverrides_returns200WithMap() throws Exception {
        when(adminPermissionService.getOverrides(2L))
            .thenReturn(Map.of("jobs.create", true, "users.ban", false));

        mockMvc.perform(get("/api/admin/permissions/users/2/overrides"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.['jobs.create']").value(true))
            .andExpect(jsonPath("$.['users.ban']").value(false));
    }

    @Test
    void getOverrides_returnsEmptyMap_whenNoOverrides() throws Exception {
        when(adminPermissionService.getOverrides(2L)).thenReturn(Map.of());

        mockMvc.perform(get("/api/admin/permissions/users/2/overrides"))
            .andExpect(status().isOk())
            .andExpect(content().json("{}"));
    }

    // ── PUT replaceOverrides ──────────────────────────────────────

    @Test
    void replaceOverrides_returns200AndCallsService() throws Exception {
        Map<String, Boolean> body = Map.of("jobs.create", true);

        mockMvc.perform(put("/api/admin/permissions/users/2/overrides")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Overrides replaced successfully"));

        verify(adminPermissionService).replaceOverrides(eq(1L), eq(2L), eq(body));
    }

    @Test
    void replaceOverrides_withEmptyBody_returns200() throws Exception {
        mockMvc.perform(put("/api/admin/permissions/users/2/overrides")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        verify(adminPermissionService).replaceOverrides(eq(1L), eq(2L), eq(Map.of()));
    }

    // ── DELETE single override ────────────────────────────────────

    @Test
    void deleteOverride_returns200() throws Exception {
        mockMvc.perform(delete("/api/admin/permissions/users/2/overrides/jobs.create"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Override deleted"));

        verify(adminPermissionService).deleteOverride(1L, 2L, "jobs.create");
    }

    // ── DELETE all overrides ──────────────────────────────────────

    @Test
    void clearOverrides_returns200() throws Exception {
        mockMvc.perform(delete("/api/admin/permissions/users/2/overrides"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("All overrides cleared"));

        verify(adminPermissionService).clearOverrides(1L, 2L);
    }

    // ── POST bulk ─────────────────────────────────────────────────

    @Test
    void bulkReplaceOverrides_returns200WithAffectedCount() throws Exception {
        var body = Map.of(
            "userIds", List.of(2, 3),
            "overrides", Map.of("jobs.create", true)
        );

        mockMvc.perform(post("/api/admin/permissions/bulk-overrides")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.affectedUsers").value(2));
    }
}
