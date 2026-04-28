package com.iting.jobportal.job.service;

import com.iting.jobportal.job.dto.response.JobResponse;

import java.util.List;

/**
 * Vector Search Service - Tìm kiếm ngữ nghĩa (semantic search)
 * sử dụng Bi-Encoder embedding + Cosine Similarity.
 */
public interface VectorSearchService {

    /**
     * Tìm kiếm job bằng semantic similarity.
     * Embed query text -> so sánh cosine similarity với tất cả job embeddings.
     *
     * @param queryText Câu truy vấn (keyword, JD text, etc.)
     * @param topK      Số lượng kết quả tối đa
     * @return Danh sách job xếp hạng theo similarity score
     */
    List<ScoredJobResult> semanticSearch(String queryText, int topK);

    /**
     * Kết quả tìm kiếm có điểm similarity.
     */
    record ScoredJobResult(Long jobId, double score) {}
}
