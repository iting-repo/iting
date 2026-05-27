package com.iting.jobportal.admin.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AdminControllerTest {

    private final AdminController controller = new AdminController();

    @Test
    void status_returnsOk() {
        ResponseEntity<Map<String, Object>> resp = controller.status();
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("ok", resp.getBody().get("status"));
    }
}
