package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.company.service.CompanyService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrCompanyControllerTest {

    @Mock private CompanyService companyService;
    @Mock private CompanyFollowService companyFollowService;
    @Mock private AuthorizationService authz;
    @InjectMocks private HrCompanyController controller;

    // ── getCompany ───────────────────────────────────────────────────────

    @Test
    void getCompany_ownCompany_returnsResponse() {
        when(authz.requireCompanyOf(99L)).thenReturn(10L);
        CompanyResponse expected = new CompanyResponse();
        when(companyService.getMyCompany(99L)).thenReturn(expected);

        ResponseEntity<CompanyResponse> resp = controller.getCompany(99L, 10L);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(expected, resp.getBody());
    }

    @Test
    void getCompany_otherCompany_throws403() {
        when(authz.requireCompanyOf(99L)).thenReturn(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getCompany(99L, 20L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // ── viewBusinessLicense ─────────────────────────────────────────────

    @Test
    void viewBusinessLicense_ownCompany_returnsPresignedUrl() {
        when(authz.requireCompanyOf(99L)).thenReturn(10L);
        when(companyService.getBusinessLicensePresignedUrlByAccountId(99L, 15))
                .thenReturn("https://s3/license");

        ResponseEntity<Map<String, String>> resp = controller.viewBusinessLicense(99L, 10L);

        assertEquals("https://s3/license", resp.getBody().get("url"));
    }

    @Test
    void viewBusinessLicense_otherCompany_throws403() {
        when(authz.requireCompanyOf(99L)).thenReturn(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.viewBusinessLicense(99L, 20L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // ── getFollowerCount ────────────────────────────────────────────────

    @Test
    void getFollowerCount_ownCompany_returnsCount() {
        when(authz.requireCompanyOf(99L)).thenReturn(10L);
        when(companyFollowService.getFollowerCount(10L)).thenReturn(150L);

        ResponseEntity<Map<String, Long>> resp = controller.getFollowerCount(99L, 10L);

        assertEquals(150L, resp.getBody().get("followerCount"));
    }

    @Test
    void getFollowerCount_otherCompany_throws403() {
        when(authz.requireCompanyOf(99L)).thenReturn(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getFollowerCount(99L, 20L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
