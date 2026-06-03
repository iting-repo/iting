package com.iting.jobportal.company.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.company.dto.request.FollowCompanyRequest;
import com.iting.jobportal.company.dto.response.FollowedCompanyResponse;
import com.iting.jobportal.company.service.CompanyFollowService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class CompanyFollowControllerTest {

  @Mock private CompanyFollowService companyFollowService;
  @InjectMocks private CompanyFollowController controller;

  @Test
  void followCompany_callsService_returnsMessage() {
    FollowCompanyRequest req = new FollowCompanyRequest();
    req.setCompanyId(5L);

    ResponseEntity<Map<String, String>> resp = controller.followCompany(1L, req);

    verify(companyFollowService).followCompany(1L, 5L);
    assertEquals("Theo dõi công ty thành công", resp.getBody().get("message"));
  }

  @Test
  void unfollowCompany_callsService_returnsMessage() {
    ResponseEntity<Map<String, String>> resp = controller.unfollowCompany(1L, 5L);

    verify(companyFollowService).unfollowCompany(1L, 5L);
    assertEquals("Bỏ theo dõi công ty thành công", resp.getBody().get("message"));
  }

  @Test
  void checkFollowing_true() {
    when(companyFollowService.isFollowing(1L, 5L)).thenReturn(true);

    ResponseEntity<Map<String, Boolean>> resp = controller.checkFollowing(1L, 5L);
    assertEquals(true, resp.getBody().get("isFollowing"));
  }

  @Test
  void checkFollowing_false() {
    when(companyFollowService.isFollowing(1L, 5L)).thenReturn(false);

    assertEquals(false, controller.checkFollowing(1L, 5L).getBody().get("isFollowing"));
  }

  @Test
  void getFollowedCompanies_paginated() {
    Page<FollowedCompanyResponse> page = new PageImpl<>(List.of());
    when(companyFollowService.getFollowedCompanies(1L, 0, 10)).thenReturn(page);

    assertSame(page, controller.getFollowedCompanies(1L, 0, 10).getBody());
  }
}
