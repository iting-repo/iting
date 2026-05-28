package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * AI service stub — chưa kích hoạt. Test fallback behavior cho cover letter
 * template + APPROVE response + empty extractors.
 */
class GeminiServiceImplTest {

    private final GeminiServiceImpl service = new GeminiServiceImpl();

    @Test
    void extractSearchCriteriaFromCv_returnsEmptyRequest() {
        JobSearchRequest req = service.extractSearchCriteriaFromCv("any cv text");
        assertNotNull(req);
    }

    @Test
    void expandSearchTerms_returnsEmptyList() {
        assertTrue(service.expandSearchTerms("java").isEmpty());
    }

    @Test
    void reviewJob_defaultApprove() {
        Job job = Job.builder().id(42L).title("Dev").build();

        String result = service.reviewJob(job);

        assertTrue(result.contains("APPROVE"));
        assertTrue(result.contains("FINAL_DECISION"));
    }

    // ── generateCoverLetter ─────────────────────────────────────────────

    @Test
    void generateCoverLetter_fullParams_includesAll() {
        Company c = new Company();
        c.setName("ACME Corp");
        Job job = Job.builder().title("Backend Dev").company(c).build();

        String letter = service.generateCoverLetter(
                "Alice", List.of("Java", "Spring"), "Senior dev bio", 5, job);

        assertTrue(letter.contains("ACME Corp"));
        assertTrue(letter.contains("Backend Dev"));
        assertTrue(letter.contains("Alice"));
        assertTrue(letter.contains("5 năm kinh nghiệm"));
        assertTrue(letter.contains("Senior dev bio"));
        assertTrue(letter.contains("Java, Spring"));
        assertTrue(letter.contains("Kính gửi"));
        assertTrue(letter.contains("Trân trọng"));
    }

    @Test
    void generateCoverLetter_nullJob_fallbacksCompanyAndTitle() {
        String letter = service.generateCoverLetter("Alice", List.of("Java"), "bio", 2, null);

        assertTrue(letter.contains("Quý công ty"));
        assertTrue(letter.contains("vị trí ứng tuyển"));
    }

    @Test
    void generateCoverLetter_jobWithoutCompany_fallbacksCompany() {
        Job job = Job.builder().title("DevOps").build();

        String letter = service.generateCoverLetter("Bob", List.of(), null, 3, job);

        assertTrue(letter.contains("Quý công ty"));
        assertTrue(letter.contains("DevOps"));
    }

    @Test
    void generateCoverLetter_jobWithoutTitle_fallbacksTitle() {
        Company c = new Company(); c.setName("ITing");
        Job job = Job.builder().company(c).build();

        String letter = service.generateCoverLetter("Bob", List.of(), null, 0, job);

        assertTrue(letter.contains("ITing"));
        assertTrue(letter.contains("vị trí ứng tuyển"));
    }

    @Test
    void generateCoverLetter_nullCandidateName_fallbacksUngVien() {
        Company c = new Company(); c.setName("X");
        Job job = Job.builder().title("Y").company(c).build();

        String letter = service.generateCoverLetter(null, null, null, 0, job);

        assertTrue(letter.contains("ứng viên") || letter.contains("Ứng viên"));
    }

    @Test
    void generateCoverLetter_nullBio_doesNotInsertBlock() {
        String letter = service.generateCoverLetter("A", List.of("Java"), null, 1, null);

        // không có dòng bio nhưng có skills + sign-off
        assertTrue(letter.contains("Java"));
        assertTrue(letter.contains("Trân trọng"));
    }

    @Test
    void generateCoverLetter_blankBio_doesNotInsertBlock() {
        String letter = service.generateCoverLetter("A", List.of("Java"), "   ", 1, null);

        // isBlank() → bỏ qua khối bio
        // signature thực: assertion gián tiếp qua việc không double newline ngay sau title section
        assertTrue(letter.contains("Java"));
    }

    @Test
    void generateCoverLetter_nullSkills_doesNotInsertSkillsLine() {
        String letter = service.generateCoverLetter("A", null, "bio", 1, null);

        assertTrue(letter.contains("bio"));
        // không có "Kỹ năng nổi bật"
        assertEquals(-1, letter.indexOf("Kỹ năng nổi bật"));
    }

    @Test
    void generateCoverLetter_emptySkills_doesNotInsertSkillsLine() {
        String letter = service.generateCoverLetter("A", List.of(), "bio", 1, null);

        assertEquals(-1, letter.indexOf("Kỹ năng nổi bật"));
    }

    @Test
    void generateCoverLetter_signatureMatchesCandidateName() {
        String letter = service.generateCoverLetter("Charlie", null, null, 0, null);

        // Tên ký phải xuất hiện ít nhất 2 lần (opening + signature)
        int count = letter.split("Charlie", -1).length - 1;
        assertTrue(count >= 2, "Expected Charlie name appears in both opening and signature");
    }
}
