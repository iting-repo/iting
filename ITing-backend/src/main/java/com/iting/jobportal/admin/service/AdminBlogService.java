package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.BlogRequest;
import com.iting.jobportal.admin.entity.Blog;
import org.springframework.data.domain.Page;

public interface AdminBlogService {

  Page<Blog> getBlogs(String keyword, String status, int page, int size);

  Blog getBlogById(Long id);

  Blog createBlog(BlogRequest request);

  Blog updateBlog(Long id, BlogRequest request);

  void deleteBlog(Long id);
}
