package com.iting.jobportal.job.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.job.dto.SavedJobResponse;
import com.iting.jobportal.job.service.UserSavedJobService;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.service.InteractionService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class UserSavedJobControllerTest {

  @Mock private UserSavedJobService savedJobService;
  @Mock private InteractionService interactionService;
  @InjectMocks private UserSavedJobController controller;

  @Test
  void getSavedJobs_paginatedFromService() {
    Page<SavedJobResponse> page = new PageImpl<>(List.of());
    when(savedJobService.getSavedJobs(eq(1L), any(PageRequest.class))).thenReturn(page);

    ResponseEntity<Page<SavedJobResponse>> resp = controller.getSavedJobs(1L, 0, 10);

    assertSame(page, resp.getBody());
  }

  @Test
  void saveJob_callsService_andTracksInteraction() {
    ResponseEntity<?> resp = controller.saveJob(1L, 42L);

    verify(savedJobService).saveJob(1L, 42L);
    verify(interactionService).trackInteraction(1L, 42L, InteractionType.SAVE);
    assertEquals("Job saved successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void saveJob_nullUserId_skipsInteractionTracking() {
    controller.saveJob(null, 42L);

    verify(savedJobService).saveJob(null, 42L);
    verify(interactionService, never()).trackInteraction(any(), any(), any());
  }

  @Test
  void unsaveJob_callsService() {
    ResponseEntity<?> resp = controller.unsaveJob(1L, 42L);

    verify(savedJobService).unsaveJob(1L, 42L);
    assertEquals("Job unsaved successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void checkSaved_true() {
    when(savedJobService.isSaved(1L, 42L)).thenReturn(true);

    assertEquals(true, controller.checkSaved(1L, 42L).getBody().get("saved"));
  }

  @Test
  void checkSaved_false() {
    when(savedJobService.isSaved(1L, 42L)).thenReturn(false);

    assertEquals(false, controller.checkSaved(1L, 42L).getBody().get("saved"));
  }

  @Test
  void countSavedJobs_returnsCount() {
    when(savedJobService.countSavedJobs(1L)).thenReturn(15L);

    assertEquals(15L, controller.countSavedJobs(1L).getBody().get("count"));
  }

  @Test
  void getSavedJobIds_delegatesToService() {
    List<Long> ids = List.of(1L, 2L, 3L);
    when(savedJobService.getSavedJobIds(1L)).thenReturn(ids);

    assertSame(ids, controller.getSavedJobIds(1L).getBody());
  }
}
