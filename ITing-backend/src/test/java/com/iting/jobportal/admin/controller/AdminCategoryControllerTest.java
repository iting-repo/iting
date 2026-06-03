package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.request.CategoryReorderRequest;
import com.iting.jobportal.admin.dto.request.CategoryRequest;
import com.iting.jobportal.admin.dto.response.CategoryResponse;
import com.iting.jobportal.admin.entity.Category;
import com.iting.jobportal.admin.service.AdminContentService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminCategoryControllerTest {

  @Mock private AdminContentService adminContentService;
  @InjectMocks private AdminCategoryController controller;

  private Category cat(Long id, String type, String name) {
    Category c = new Category();
    c.setId(id);
    c.setType(type);
    c.setName(name);
    c.setActive(true);
    return c;
  }

  // ── getCategoriesByType ──────────────────────────────────────────────

  @Test
  void getCategoriesByType_mapsListToResponse() {
    when(adminContentService.getCategoriesByType("SKILL"))
        .thenReturn(List.of(cat(1L, "SKILL", "Java"), cat(2L, "SKILL", "Python")));

    ResponseEntity<List<CategoryResponse>> resp = controller.getCategoriesByType("SKILL");

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(2, resp.getBody().size());
    assertEquals("Java", resp.getBody().get(0).getName());
  }

  @Test
  void getCategoriesByType_empty_returnsEmptyList() {
    when(adminContentService.getCategoriesByType("LOCATION")).thenReturn(List.of());
    assertTrue(controller.getCategoriesByType("LOCATION").getBody().isEmpty());
  }

  // ── summary ──────────────────────────────────────────────────────────

  @Test
  void getCategorySummary_delegatesToService() {
    Map<String, Long> stats = Map.of("SKILL", 100L, "LOCATION", 63L);
    when(adminContentService.getCategorySummary()).thenReturn(stats);

    assertEquals(stats, controller.getCategorySummary().getBody());
  }

  // ── industries enum ─────────────────────────────────────────────────

  @Test
  void getIndustryEnumValues_returnsAllIndustriesWithThreeFields() {
    ResponseEntity<List<Map<String, String>>> resp = controller.getIndustryEnumValues();

    List<Map<String, String>> result = resp.getBody();
    assertNotNull(result);
    assertFalse(result.isEmpty(), "Industry enum phải có ≥1 value");
    for (Map<String, String> m : result) {
      assertNotNull(m.get("value"));
      assertNotNull(m.get("name"));
      assertNotNull(m.get("nameEn"));
    }
  }

  // ── getCategoryById ──────────────────────────────────────────────────

  @Test
  void getCategoryById_delegatesToService() {
    Category c = cat(5L, "SKILL", "Go");
    when(adminContentService.getCategoryById(5L)).thenReturn(c);

    ResponseEntity<CategoryResponse> resp = controller.getCategoryById(5L);

    assertEquals("Go", resp.getBody().getName());
  }

  // ── create ───────────────────────────────────────────────────────────

  @Test
  void createCategory_uppercasesType_returns201() {
    CategoryRequest req = new CategoryRequest();
    req.setName("React");
    when(adminContentService.createCategoryFromRequest("SKILL", req))
        .thenReturn(cat(10L, "SKILL", "React"));

    ResponseEntity<CategoryResponse> resp = controller.createCategory("skill", req);

    assertEquals(HttpStatus.CREATED, resp.getStatusCode());
    verify(adminContentService).createCategoryFromRequest("SKILL", req);
  }

  // ── update ───────────────────────────────────────────────────────────

  @Test
  void updateCategory_delegatesToService() {
    CategoryRequest req = new CategoryRequest();
    req.setName("Updated");
    when(adminContentService.updateCategoryFromRequest(5L, req))
        .thenReturn(cat(5L, "SKILL", "Updated"));

    ResponseEntity<CategoryResponse> resp = controller.updateCategory(5L, req);

    assertEquals("Updated", resp.getBody().getName());
  }

  // ── delete ───────────────────────────────────────────────────────────

  @Test
  void deleteCategory_callsService_returnsMessage() {
    ResponseEntity<Map<String, String>> resp = controller.deleteCategory(5L);

    verify(adminContentService).deleteCategory(5L);
    assertEquals("Đã xóa danh mục thành công", resp.getBody().get("message"));
  }

  // ── toggleActive ─────────────────────────────────────────────────────

  @Test
  void toggleActive_delegatesToService() {
    when(adminContentService.toggleCategoryActive(5L)).thenReturn(cat(5L, "SKILL", "X"));

    ResponseEntity<CategoryResponse> resp = controller.toggleActive(5L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    verify(adminContentService).toggleCategoryActive(5L);
  }

  // ── reorder ──────────────────────────────────────────────────────────

  @Test
  void reorderCategories_uppercasesType_passesOrderedIds() {
    CategoryReorderRequest req = new CategoryReorderRequest();
    req.setOrderedIds(List.of(3L, 1L, 2L));

    ResponseEntity<Map<String, String>> resp = controller.reorderCategories("location", req);

    verify(adminContentService).reorderCategories("LOCATION", List.of(3L, 1L, 2L));
    assertEquals("Đã cập nhật thứ tự", resp.getBody().get("message"));
  }
}
