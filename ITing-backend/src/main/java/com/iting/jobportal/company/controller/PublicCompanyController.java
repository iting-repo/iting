package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/companies")
@RequiredArgsConstructor
@Tag(name = "11. Public Companies", description = "Public APIs for company lookup")
public class PublicCompanyController {

  private final CompanyService companyService;

  @GetMapping
  @Operation(summary = "Search and list companies")
  public ResponseEntity<Page<CompanyResponse>> searchCompanies(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String location,
      @RequestParam(required = false) String industry,
      @RequestParam(required = false) String size,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size_page) {
    return ResponseEntity.ok(
        companyService.searchCompanies(keyword, location, industry, size, page, size_page));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get company detail")
  public ResponseEntity<CompanyResponse> getCompany(@PathVariable Long id) {
    return ResponseEntity.ok(companyService.getCompanyById(id));
  }
}
