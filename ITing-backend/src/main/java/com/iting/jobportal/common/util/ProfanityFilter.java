package com.iting.jobportal.common.util;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Utility class to detect and filter profanity / offensive language
 * in user-generated content (reviews, comments, etc.).
 *
 * Supports Vietnamese and English profanity.
 */
public final class ProfanityFilter {

    private ProfanityFilter() {}

    // ── Vietnamese profanity / vulgar words ──
    private static final List<String> BLOCKED_WORDS = Arrays.asList(
        // Vietnamese vulgar
        "đụ", "địt", "đéo", "đù", "đĩ", "lồn", "buồi", "cặc", "dái",
        "đ\\.", "đ\\.m", "đcm", "dcm", "đkm", "dkm", "vl", "vãi",
        "clgt", "cmnr", "wtf", "cmn", "vcl", "vkl", "đml", "dml",
        "con mẹ", "con đĩ", "thằng chó", "con chó", "đồ chó",
        "ngu", "óc chó", "não chó", "mặt lồn", "mặt cặc",
        "chết mẹ", "chết cha", "thằng khốn", "đồ khốn",
        "mẹ mày", "má mày", "cha mày", "bố mày",
        "đù má", "đụ má", "địt mẹ", "dit me",
        "cứt", "đái", "ỉa",
        // Leetspeak / bypass variants
        "d1t", "d!t", "đ!t", "l0n", "l0̀n",
        // English profanity
        "fuck", "shit", "bitch", "asshole", "dick", "pussy",
        "motherfucker", "cunt", "bastard", "slut", "whore",
        "damn", "stfu", "lmao"
    );

    // Build a single regex pattern for efficiency
    private static final Pattern PROFANITY_PATTERN;

    static {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < BLOCKED_WORDS.size(); i++) {
            if (i > 0) sb.append("|");
            // Word boundary or start/end matching, case-insensitive
            sb.append("(?:").append(BLOCKED_WORDS.get(i)).append(")");
        }
        PROFANITY_PATTERN = Pattern.compile(sb.toString(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    }

    /**
     * Check if the given text contains profanity.
     *
     * @param text the user-generated content to check
     * @return true if profanity is detected
     */
    public static boolean containsProfanity(String text) {
        if (text == null || text.isBlank()) return false;
        // Normalize: remove extra spaces, lowercase
        String normalized = text.toLowerCase().trim();
        return PROFANITY_PATTERN.matcher(normalized).find();
    }

    /**
     * Replace detected profanity with asterisks (***).
     *
     * @param text the original text
     * @return sanitized text with profanity replaced by ***
     */
    public static String censor(String text) {
        if (text == null || text.isBlank()) return text;
        return PROFANITY_PATTERN.matcher(text).replaceAll("***");
    }
}
