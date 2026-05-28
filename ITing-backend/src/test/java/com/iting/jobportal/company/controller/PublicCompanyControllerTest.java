package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.service.CompanyService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicCompanyControllerTest {

    @Mock private CompanyService companyService;
    @InjectMocks private PublicCompanyController controller;

    @Test
    void searchCompanies_passesAllFilters() {
        Page<CompanyResponse> page = new PageImpl<>(List.of());
        when(companyService.searchCompanies("ACME", "HCM", "TECH", "100-500", 0, 10)).thenReturn(page);

        ResponseEntity<Page<CompanyResponse>> resp = controller.searchCompanies(
                "ACME", "HCM", "TECH", "100-500", 0, 10);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void searchCompanies_nullFilters() {
        when(companyService.searchCompanies(null, null, null, null, 0, 10))
                .thenReturn(new PageImpl<>(List.of()));

        controller.searchCompanies(null, null, null, null, 0, 10);

        verify(companyService).searchCompanies(null, null, null, null, 0, 10);
    }

    @Test
    void getCompany_delegatesToService() {
        CompanyResponse expected = new CompanyResponse();
        when(companyService.getCompanyById(5L)).thenReturn(expected);

        assertSame(expected, controller.getCompany(5L).getBody());
    }
}
