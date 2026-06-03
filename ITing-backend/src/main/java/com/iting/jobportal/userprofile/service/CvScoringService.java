package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.response.CvScoreResponse;

/**
 * Stateless LLM-based CV quality scoring.
 * Score is computed on-demand and persisted on the CV entity.
 * Supports bilingual output (Vietnamese / English) via the `lang` parameter.
 */
public interface CvScoringService {

    /**
     * Score a CV using stored extracted data + Gemini.
     *
     * @param cvId      the CV record ID
     * @param language  output language — "vi" (default) for Vietnamese or "en" for English
     * @return the structured score result, or null on error / not found
     */
    CvScoreResponse scoreCv(Long cvId, String language);

    /**
     * Score raw CV text directly (no file fetch / no persistence).
     *
     * @param cvText    plain-text CV content
     * @param language  output language — "vi" (default) or "en"
     * @return the structured score result, or null if text is blank
     */
    CvScoreResponse scoreFromText(String cvText, String language);
}