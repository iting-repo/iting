package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.Banner;
import com.iting.jobportal.admin.repository.BannerRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminBannerControllerTest {

  @Mock private BannerRepository bannerRepository;
  @Mock private com.iting.jobportal.admin.repository.SystemConfigRepository systemConfigRepository;

  @InjectMocks private AdminBannerController controller;

  // ── getAllBanners ────────────────────────────────────────────────────

  @Test
  void getAllBanners_returnsRepoFindAll() {
    Banner b = Banner.builder().id(1L).title("Sale").build();
    when(bannerRepository.findAll()).thenReturn(List.of(b));

    ResponseEntity<List<Banner>> resp = controller.getAllBanners();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(1, resp.getBody().size());
    assertSame(b, resp.getBody().get(0));
  }

  // ── getBanner ────────────────────────────────────────────────────────

  @Test
  void getBanner_found_returnsOk() {
    Banner b = Banner.builder().id(1L).build();
    when(bannerRepository.findById(1L)).thenReturn(Optional.of(b));

    ResponseEntity<Banner> resp = controller.getBanner(1L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(b, resp.getBody());
  }

  @Test
  void getBanner_notFound_returns404() {
    when(bannerRepository.findById(99L)).thenReturn(Optional.empty());

    ResponseEntity<Banner> resp = controller.getBanner(99L);

    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
  }

  // ── createBanner ─────────────────────────────────────────────────────

  @Test
  void createBanner_nullStatus_defaultsActive() {
    Banner input = Banner.builder().title("X").position("homepage_main").build();
    when(bannerRepository.save(any(Banner.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.createBanner(input);

    ArgumentCaptor<Banner> cap = ArgumentCaptor.forClass(Banner.class);
    verify(bannerRepository).save(cap.capture());
    assertEquals("ACTIVE", cap.getValue().getStatus());
  }

  @Test
  void createBanner_nullPriority_defaultsZero() {
    Banner input = Banner.builder().title("X").build();
    when(bannerRepository.save(any(Banner.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.createBanner(input);

    ArgumentCaptor<Banner> cap = ArgumentCaptor.forClass(Banner.class);
    verify(bannerRepository).save(cap.capture());
    assertEquals(0, cap.getValue().getPriority());
  }

  @Test
  void createBanner_existingStatusAndPriority_preserved() {
    Banner input = Banner.builder().title("X").status("INACTIVE").priority(5).build();
    when(bannerRepository.save(any(Banner.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.createBanner(input);

    ArgumentCaptor<Banner> cap = ArgumentCaptor.forClass(Banner.class);
    verify(bannerRepository).save(cap.capture());
    assertEquals("INACTIVE", cap.getValue().getStatus());
    assertEquals(5, cap.getValue().getPriority());
  }

  // ── updateBanner ─────────────────────────────────────────────────────

  @Test
  void updateBanner_found_overridesAllFields() {
    Banner existing = Banner.builder().id(1L).title("OLD").position("old_pos").build();
    Banner update =
        Banner.builder()
            .title("NEW")
            .position("new_pos")
            .imageDesktop("d.png")
            .imageMobile("m.png")
            .link("/new")
            .priority(10)
            .status("INACTIVE")
            .build();
    when(bannerRepository.findById(1L)).thenReturn(Optional.of(existing));
    when(bannerRepository.save(existing)).thenReturn(existing);

    ResponseEntity<Banner> resp = controller.updateBanner(1L, update);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals("NEW", existing.getTitle());
    assertEquals("new_pos", existing.getPosition());
    assertEquals("d.png", existing.getImageDesktop());
    assertEquals("m.png", existing.getImageMobile());
    assertEquals("/new", existing.getLink());
    assertEquals(10, existing.getPriority());
    assertEquals("INACTIVE", existing.getStatus());
  }

  @Test
  void updateBanner_notFound_returns404_noSave() {
    when(bannerRepository.findById(99L)).thenReturn(Optional.empty());

    ResponseEntity<Banner> resp = controller.updateBanner(99L, Banner.builder().build());

    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    verify(bannerRepository, never()).save(any(Banner.class));
  }

  // ── deleteBanner ─────────────────────────────────────────────────────

  @Test
  void deleteBanner_found_deletes() {
    Banner b = Banner.builder().id(1L).build();
    when(bannerRepository.findById(1L)).thenReturn(Optional.of(b));

    ResponseEntity<?> resp = controller.deleteBanner(1L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    verify(bannerRepository).delete(b);
  }

  @Test
  void deleteBanner_notFound_returns404_noDelete() {
    when(bannerRepository.findById(99L)).thenReturn(Optional.empty());

    ResponseEntity<?> resp = controller.deleteBanner(99L);

    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    verify(bannerRepository, never()).delete(any(Banner.class));
  }

  // ── toggleBannerStatus ───────────────────────────────────────────────

  @Test
  void toggleBannerStatus_found_setsNewStatus() {
    Banner b = Banner.builder().id(1L).status("ACTIVE").build();
    when(bannerRepository.findById(1L)).thenReturn(Optional.of(b));
    when(bannerRepository.save(b)).thenReturn(b);

    ResponseEntity<Banner> resp = controller.toggleBannerStatus(1L, "INACTIVE");

    assertNotNull(resp.getBody());
    assertEquals("INACTIVE", b.getStatus());
  }

  @Test
  void toggleBannerStatus_notFound_returns404() {
    when(bannerRepository.findById(99L)).thenReturn(Optional.empty());

    ResponseEntity<Banner> resp = controller.toggleBannerStatus(99L, "INACTIVE");

    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
  }
}
