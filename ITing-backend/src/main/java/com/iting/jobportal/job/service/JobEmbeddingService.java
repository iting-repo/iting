package com.iting.jobportal.job.service;

import com.iting.jobportal.job.entity.Job;

/**
 * Service để tạo và quản lý embedding cho Job entities. Sử dụng OpenAI text-embedding-3-small để
 * biến JD thành vector.
 */
public interface JobEmbeddingService {

  /**
   * Tạo embedding cho một job dựa trên nội dung JD. Lưu vào trường jobEmbedding của entity.
   *
   * @param job Job entity cần embed
   * @return true nếu thành công
   */
  boolean embedJob(Job job);

  /**
   * Batch embed tất cả job chưa có embedding. Dùng cho scheduled task chạy hàng đêm.
   *
   * @param batchSize Số lượng job tối đa mỗi batch
   * @return Số job đã embed thành công
   */
  int embedMissingJobs(int batchSize);

  /** Parse embedding string (JSON array) thành double array. */
  double[] parseEmbedding(String embeddingJson);
}
