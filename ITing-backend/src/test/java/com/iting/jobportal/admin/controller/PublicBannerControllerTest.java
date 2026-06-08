package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.Banner;
import com.iting.jobportal.admin.repository.BannerRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class PublicBannerControllerTest {

  @Mock private BannerRepository bannerRepository;
  @InjectMocks private PublicBannerController controller;

  private Banner banner(String status, LocalDateTime start, LocalDateTime end) {
    return Banner.builder().id(1L).title("x").status(status).startAt(start).endAt(end).build();
  }

  // ── Position filter ──────────────────────────────────────────────────

  @Test
  void getActiveBanners_withPosition_queriesByPosition() {
    when(bannerRepository.findByPositionOrderByPriorityDesc("homepage_main"))
        .thenReturn(List.of(banner("ACTIVE", null, null)));

    controller.getActiveBanners("homepage_main", null);

    verify(bannerRepository).findByPositionOrderByPriorityDesc("homepage_main");
    verify(bannerRepository, never()).findByStatusOrderByPriorityDesc("ACTIVE");
  }

  @Test
  void getActiveBanners_noPosition_queriesByStatusActive() {
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE"))
        .thenReturn(List.of(banner("ACTIVE", null, null)));

    controller.getActiveBanners(null, null);

    verify(bannerRepository).findByStatusOrderByPriorityDesc("ACTIVE");
  }

  @Test
  void getActiveBanners_emptyPosition_queriesByStatusActive() {
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE")).thenReturn(List.of());

    controller.getActiveBanners("", null);

    verify(bannerRepository).findByStatusOrderByPriorityDesc("ACTIVE");
  }

  // ── Active + date window filtering ───────────────────────────────────

  @Test
  void getActiveBanners_inactiveStatus_filteredOut() {
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE"))
        .thenReturn(List.of(banner("INACTIVE", null, null)));

    ResponseEntity<List<Banner>> resp = controller.getActiveBanners(null, null);

    assertTrue(resp.getBody().isEmpty(), "INACTIVE banner phải bị filter ra dù repo trả về");
  }

  @Test
  void getActiveBanners_startAtInFuture_filteredOut() {
    LocalDateTime future = LocalDateTime.now().plusDays(7);
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE"))
        .thenReturn(List.of(banner("ACTIVE", future, null)));

    assertTrue(
        controller.getActiveBanners(null, null).getBody().isEmpty(), "Banner chưa tới startAt → ẩn");
  }

  @Test
  void getActiveBanners_endAtInPast_filteredOut() {
    LocalDateTime past = LocalDateTime.now().minusDays(7);
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE"))
        .thenReturn(List.of(banner("ACTIVE", null, past)));

    assertTrue(controller.getActiveBanners(null, null).getBody().isEmpty(), "Banner hết hạn → ẩn");
  }

  @Test
  void getActiveBanners_currentlyActive_shown() {
    LocalDateTime past = LocalDateTime.now().minusDays(1);
    LocalDateTime future = LocalDateTime.now().plusDays(1);
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE"))
        .thenReturn(List.of(banner("ACTIVE", past, future)));

    assertEquals(1, controller.getActiveBanners(null, null).getBody().size());
  }

  @Test
  void getActiveBanners_nullStartAndEnd_shown() {
    when(bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE"))
        .thenReturn(List.of(banner("ACTIVE", null, null)));

    assertEquals(1, controller.getActiveBanners(null, null).getBody().size());
  }
}
