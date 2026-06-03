package com.iting.jobportal.recommendation.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.recommendation.dto.response.SearchHistoryResponse;
import com.iting.jobportal.recommendation.service.InteractionService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class SearchHistoryControllerTest {

  @Mock private InteractionService interactionService;
  @InjectMocks private SearchHistoryController controller;

  @Test
  void getMyHistory_nullUser_returnsEmptyAndSkipsService() {
    ResponseEntity<List<SearchHistoryResponse>> resp = controller.getMyHistory(null, 10);

    assertEquals(200, resp.getStatusCode().value());
    assertTrue(resp.getBody().isEmpty());
    verify(interactionService, never()).getSearchHistory(any(), anyInt());
  }

  @Test
  void getMyHistory_loggedIn_delegatesToService() {
    SearchHistoryResponse row = SearchHistoryResponse.builder().id(1L).keyword("java").build();
    when(interactionService.getSearchHistory(7L, 10)).thenReturn(List.of(row));

    ResponseEntity<List<SearchHistoryResponse>> resp = controller.getMyHistory(7L, 10);

    assertEquals(1, resp.getBody().size());
    assertEquals("java", resp.getBody().get(0).getKeyword());
  }

  @Test
  void deleteOne_callsService() {
    ResponseEntity<Map<String, String>> resp = controller.deleteOne(7L, 99L);

    verify(interactionService).deleteSearchHistoryItem(7L, 99L);
    assertEquals("Đã xoá", resp.getBody().get("message"));
  }

  @Test
  void clearAll_returnsDeletedCount() {
    when(interactionService.clearSearchHistory(7L)).thenReturn(3);

    ResponseEntity<Map<String, Object>> resp = controller.clearAll(7L);

    assertEquals(3, resp.getBody().get("deleted"));
    assertEquals("Đã xoá", resp.getBody().get("message"));
  }

  // helper for any() / anyInt() static imports
  private static <T> T any() {
    return org.mockito.ArgumentMatchers.any();
  }

  private static int anyInt() {
    return org.mockito.ArgumentMatchers.anyInt();
  }
}
