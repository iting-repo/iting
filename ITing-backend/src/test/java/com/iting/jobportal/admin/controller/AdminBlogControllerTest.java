package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.BlogRequest;
import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.service.AdminBlogService;
import com.iting.jobportal.file.FileUploadService;
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

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBlogControllerTest {

    @Mock private AdminBlogService adminBlogService;
    @Mock private FileUploadService fileUploadService;
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
        when(fileUploadService.uploadBlogImage(any(MultipartFile.class))).thenReturn("https://s3/img.jpg");

        ResponseEntity<Map<String, String>> resp = controller.uploadImage(file);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("https://s3/img.jpg", resp.getBody().get("url"));
    }

    @Test
    void uploadImage_nullFile_returns400() {
        ResponseEntity<Map<String, String>> resp = controller.uploadImage(null);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals("File rỗng", resp.getBody().get("error"));
        verify(fileUploadService, never()).uploadBlogImage(any());
    }

    @Test
    void uploadImage_emptyFile_returns400() {
        MockMultipartFile empty = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[0]);
        ResponseEntity<Map<String, String>> resp = controller.uploadImage(empty);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        verify(fileUploadService, never()).uploadBlogImage(any());
    }

    @Test
    void uploadImage_nonImageContentType_returns400() {
        MockMultipartFile pdf = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[1024]);
        ResponseEntity<Map<String, String>> resp = controller.uploadImage(pdf);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals("Chỉ chấp nhận file ảnh", resp.getBody().get("error"));
        verify(fileUploadService, never()).uploadBlogImage(any());
    }

    @Test
    void uploadImage_nullContentType_returns400() {
        MockMultipartFile noType = new MockMultipartFile("file", "img.jpg", null, new byte[1024]);
        ResponseEntity<Map<String, String>> resp = controller.uploadImage(noType);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    }

    @Test
    void uploadImage_oversizeFile_returns400() {
        // 5MB + 1 byte
        byte[] big = new byte[(int)(5L * 1024 * 1024 + 1)];
        MockMultipartFile oversize = new MockMultipartFile("file", "big.png", "image/png", big);

        ResponseEntity<Map<String, String>> resp = controller.uploadImage(oversize);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals("Ảnh tối đa 5MB", resp.getBody().get("error"));
        verify(fileUploadService, never()).uploadBlogImage(any());
    }

    @Test
    void uploadImage_exactly5MB_accepted() {
        byte[] exact = new byte[(int)(5L * 1024 * 1024)];
        MockMultipartFile exactSize = new MockMultipartFile("file", "5mb.png", "image/png", exact);
        when(fileUploadService.uploadBlogImage(any(MultipartFile.class))).thenReturn("https://s3/5mb.png");

        ResponseEntity<Map<String, String>> resp = controller.uploadImage(exactSize);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }
}
