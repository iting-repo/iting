package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.request.BlogRequest;
import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.service.AdminBlogService;
import com.iting.jobportal.file.FileUploadService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class AdminBlogControllerTest {

  @Mock private AdminBlogService adminBlogService;
  @Mock private FileUploadService fileUploadService;
  @Mock private com.iting.jobportal.file.FileValidator fileValidator;

  @InjectMocks private AdminBlogController controller;

  // ── getBlogs ─────────────────────────────────────────────────────────

  @Test
  void getBlogs_passesAllFilters() {
    Page<Blog> page = new PageImpl<>(List.of());
    when(adminBlogService.getBlogs("react", "PUBLISHED", 1, 50)).thenReturn(page);

    ResponseEntity<Page<Blog>> resp = controller.getBlogs("react", "PUBLISHED", 1, 50);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(page, resp.getBody());
  }

  // ── getBlogById / create / update ───────────────────────────────────

  @Test
  void getBlogById_delegatesToService() {
    Blog b = new Blog();
    when(adminBlogService.getBlogById(5L)).thenReturn(b);
    assertSame(b, controller.getBlogById(5L).getBody());
  }

  @Test
  void createBlog_delegatesToService() {
    BlogRequest req = new BlogRequest();
    Blog created = new Blog();
    when(adminBlogService.createBlog(req)).thenReturn(created);

    assertSame(created, controller.createBlog(req).getBody());
  }

  @Test
  void updateBlog_delegatesToService() {
    BlogRequest req = new BlogRequest();
    Blog updated = new Blog();
    when(adminBlogService.updateBlog(5L, req)).thenReturn(updated);

    assertSame(updated, controller.updateBlog(5L, req).getBody());
  }

  @Test
  void deleteBlog_callsService_returnsMessage() {
    ResponseEntity<?> resp = controller.deleteBlog(5L);
    verify(adminBlogService).deleteBlog(5L);
    assertEquals("Đã xóa bài viết thành công", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── uploadImage: validation + happy path ────────────────────────────

  @Test
  void uploadImage_validImage_returnsUrl() {
    MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[1024]);
    when(fileUploadService.uploadBlogImage(any(MultipartFile.class)))
        .thenReturn("https://s3/img.jpg");

    ResponseEntity<Map<String, String>> resp = controller.uploadImage(file);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals("https://s3/img.jpg", resp.getBody().get("url"));
  }

  @Test
  void uploadImage_invalidFile_propagatesValidationError() {
    // Validation đã chuyển sang FileValidator (ném 400). Controller chỉ delegate + propagate lỗi.
    MockMultipartFile bad = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[0]);
    doThrow(
            new org.springframework.web.server.ResponseStatusException(
                HttpStatus.BAD_REQUEST, "File không hợp lệ"))
        .when(fileValidator)
        .validate(any(), any());

    assertThrows(
        org.springframework.web.server.ResponseStatusException.class,
        () -> controller.uploadImage(bad));
    verify(fileUploadService, never()).uploadBlogImage(any());
  }

  @Test
  void uploadImage_delegatesToFileValidatorWithBlogCategory() {
    MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[1024]);
    when(fileUploadService.uploadBlogImage(any())).thenReturn("https://s3/img.jpg");

    controller.uploadImage(file);

    verify(fileValidator)
        .validate(eq(file), eq(com.iting.jobportal.file.FileValidator.Category.BLOG_IMAGE));
  }

  @Test
  void uploadImage_exactly5MB_accepted() {
    byte[] exact = new byte[(int) (5L * 1024 * 1024)];
    MockMultipartFile exactSize = new MockMultipartFile("file", "5mb.png", "image/png", exact);
    when(fileUploadService.uploadBlogImage(any(MultipartFile.class)))
        .thenReturn("https://s3/5mb.png");

    ResponseEntity<Map<String, String>> resp = controller.uploadImage(exactSize);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
  }
}
