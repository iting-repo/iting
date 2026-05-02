package com.iting.jobportal.common.service;

import java.util.List;

/**
 * Client interface for communicating with the Python ML Microservice.
 * Provides Cross-Encoder reranking, Bi-Encoder embedding, and Skill NER.
 */
public interface MlServiceClient {

    /**
     * Rerank documents against a query using Cross-Encoder.
     *
     * @param query     The search query
     * @param documents List of document texts (JD content)
     * @param docIds    Corresponding document IDs (Job IDs)
     * @return Reranked results sorted by relevance score
     */
    List<RankedResult> rerank(String query, List<String> documents, List<Long> docIds);

    /**
     * Extract skills from text using NER.
     *
     * @param text Raw text (JD or CV content)
     * @return List of extracted skill names
     */
    List<String> extractSkills(String text);

    /**
     * Check if the ML service is available.
     */
    boolean isAvailable();

    /**
     * Result of reranking operation.
     */
    record RankedResult(Long id, double score) {
    }

    /**
     * Extracted skill with category.
     */
    record ExtractedSkill(String skill, String category) {
    }
}
