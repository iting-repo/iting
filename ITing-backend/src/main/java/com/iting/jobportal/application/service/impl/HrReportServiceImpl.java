package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.response.HrReportResponse;
import com.iting.jobportal.application.dto.response.HrReportResponse.JobBreakdown;
import com.iting.jobportal.application.dto.response.HrReportResponse.TimeSeriesPoint;
import com.iting.jobportal.application.service.HrReportService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * Tổng hợp số liệu cho dashboard báo cáo HR.
 * Dùng native SQL cho query group-by hiệu năng tốt; mỗi method là 1 query
 * độc lập, kết quả ghép vào HrReportResponse cuối.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HrReportServiceImpl implements HrReportService {

    @PersistenceContext
    private final EntityManager em;

    private static final List<String> STAGES = List.of(
            "SCREENING", "PHONE_SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED");

    @Override
    @Transactional(readOnly = true)
    public HrReportResponse buildOverview(Long hrAccountId, LocalDate from, LocalDate to) {
        LocalDateTime fromTs = from.atStartOfDay();
        LocalDateTime toTs = to.atTime(LocalTime.MAX);

        long totalApplications = countApplications(hrAccountId, fromTs, toTs);
        long totalJobs = countJobs(hrAccountId, false);
        long activeJobs = countJobs(hrAccountId, true);
        long aiMatchCount = countCreditTxBySource(hrAccountId, "AI_CANDIDATE_MATCH", fromTs, toTs);
        long boostedJobs = countBoostedJobs(hrAccountId);

        Map<String, Long> byStage = applicationsByStage(hrAccountId, fromTs, toTs);

        long totalSpentVnd = sumPaymentVnd(hrAccountId, fromTs, toTs);
        long creditsGranted = sumCreditAmount(hrAccountId, true, fromTs, toTs);
        long creditsSpent = Math.abs(sumCreditAmount(hrAccountId, false, fromTs, toTs));
        long creditsBalance = currentCreditBalance(hrAccountId);

        Map<String, Double> costPerStage = new LinkedHashMap<>();
        for (String s : STAGES) {
            long count = byStage.getOrDefault(s, 0L);
            costPerStage.put(s, count == 0 ? 0.0 : (double) totalSpentVnd / count);
        }

        List<TimeSeriesPoint> timeSeries = buildTimeSeries(hrAccountId, fromTs, toTs);
        List<JobBreakdown> topJobs = topJobs(hrAccountId, fromTs, toTs, 5);

        return HrReportResponse.builder()
                .totalApplications(totalApplications)
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .aiMatchCount(aiMatchCount)
                .boostedJobs(boostedJobs)
                .applicationsByStage(byStage)
                .totalSpentVnd(totalSpentVnd)
                .creditsGranted(creditsGranted)
                .creditsSpent(creditsSpent)
                .creditsBalance(creditsBalance)
                .costPerStageVnd(costPerStage)
                .timeSeries(timeSeries)
                .topJobs(topJobs)
                .build();
    }

    // ── Helpers ──

    private long countApplications(Long hrId, LocalDateTime from, LocalDateTime to) {
        Object o = em.createNativeQuery("""
                SELECT COUNT(*) FROM apply_form_user_to_job a
                JOIN job j ON j.id = a.job_id
                WHERE j.posted_by_hr_id = :hr
                  AND a.time_sent BETWEEN :from AND :to
                """)
                .setParameter("hr", hrId)
                .setParameter("from", Timestamp.valueOf(from))
                .setParameter("to", Timestamp.valueOf(to))
                .getSingleResult();
        return ((Number) o).longValue();
    }

    private long countJobs(Long hrId, boolean activeOnly) {
        String sql = "SELECT COUNT(*) FROM job WHERE posted_by_hr_id = :hr"
                + (activeOnly ? " AND status = 'ACTIVE'" : "");
        Object o = em.createNativeQuery(sql).setParameter("hr", hrId).getSingleResult();
        return ((Number) o).longValue();
    }

    private long countBoostedJobs(Long hrId) {
        Object o = em.createNativeQuery("""
                SELECT COUNT(*) FROM job
                WHERE posted_by_hr_id = :hr AND featured_until IS NOT NULL AND featured_until > NOW()
                """).setParameter("hr", hrId).getSingleResult();
        return ((Number) o).longValue();
    }

    private long countCreditTxBySource(Long accountId, String source, LocalDateTime from, LocalDateTime to) {
        Object o = em.createNativeQuery("""
                SELECT COUNT(*) FROM credit_transaction
                WHERE account_id = :acc AND source = :src
                  AND created_at BETWEEN :from AND :to
                """)
                .setParameter("acc", accountId)
                .setParameter("src", source)
                .setParameter("from", Timestamp.valueOf(from))
                .setParameter("to", Timestamp.valueOf(to))
                .getSingleResult();
        return ((Number) o).longValue();
    }

    private long sumCreditAmount(Long accountId, boolean positiveOnly, LocalDateTime from, LocalDateTime to) {
        String cond = positiveOnly ? "amount > 0" : "amount < 0";
        Object o = em.createNativeQuery("""
                SELECT COALESCE(SUM(amount), 0) FROM credit_transaction
                WHERE account_id = :acc AND %s
                  AND created_at BETWEEN :from AND :to
                """.formatted(cond))
                .setParameter("acc", accountId)
                .setParameter("from", Timestamp.valueOf(from))
                .setParameter("to", Timestamp.valueOf(to))
                .getSingleResult();
        return ((Number) o).longValue();
    }

    private long currentCreditBalance(Long accountId) {
        try {
            Object o = em.createNativeQuery("SELECT credits FROM account WHERE id = :acc")
                    .setParameter("acc", accountId).getSingleResult();
            return ((Number) o).longValue();
        } catch (Exception e) {
            return 0L;
        }
    }

    private long sumPaymentVnd(Long accountId, LocalDateTime from, LocalDateTime to) {
        try {
            Object o = em.createNativeQuery("""
                    SELECT COALESCE(SUM(amount), 0) FROM payment_orders
                    WHERE account_id = :acc AND status = 'PAID'
                      AND created_at BETWEEN :from AND :to
                    """)
                    .setParameter("acc", accountId)
                    .setParameter("from", Timestamp.valueOf(from))
                    .setParameter("to", Timestamp.valueOf(to))
                    .getSingleResult();
            if (o instanceof BigDecimal bd) return bd.longValue();
            return ((Number) o).longValue();
        } catch (Exception e) {
            log.warn("[HrReport] sumPaymentVnd failed: {}", e.getMessage());
            return 0L;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Long> applicationsByStage(Long hrId, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = em.createNativeQuery("""
                SELECT a.pipeline_stage, COUNT(*) FROM apply_form_user_to_job a
                JOIN job j ON j.id = a.job_id
                WHERE j.posted_by_hr_id = :hr
                  AND a.time_sent BETWEEN :from AND :to
                GROUP BY a.pipeline_stage
                """)
                .setParameter("hr", hrId)
                .setParameter("from", Timestamp.valueOf(from))
                .setParameter("to", Timestamp.valueOf(to))
                .getResultList();
        Map<String, Long> result = new LinkedHashMap<>();
        for (String s : STAGES) result.put(s, 0L);
        for (Object[] row : rows) {
            String stage = row[0] == null ? "SCREENING" : (String) row[0];
            long cnt = ((Number) row[1]).longValue();
            result.put(stage, cnt);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<TimeSeriesPoint> buildTimeSeries(Long hrId, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = em.createNativeQuery("""
                SELECT DATE(a.time_sent) AS d,
                       COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'INTERVIEW') AS itv,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'OFFER')     AS off,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'HIRED')     AS hir,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'REJECTED')  AS rej
                FROM apply_form_user_to_job a
                JOIN job j ON j.id = a.job_id
                WHERE j.posted_by_hr_id = :hr
                  AND a.time_sent BETWEEN :from AND :to
                GROUP BY DATE(a.time_sent)
                ORDER BY DATE(a.time_sent)
                """)
                .setParameter("hr", hrId)
                .setParameter("from", Timestamp.valueOf(from))
                .setParameter("to", Timestamp.valueOf(to))
                .getResultList();

        List<TimeSeriesPoint> result = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            LocalDate d = ((Date) row[0]).toLocalDate();
            result.add(TimeSeriesPoint.builder()
                    .date(d)
                    .applications(((Number) row[1]).longValue())
                    .interviews(((Number) row[2]).longValue())
                    .offers(((Number) row[3]).longValue())
                    .hired(((Number) row[4]).longValue())
                    .rejected(((Number) row[5]).longValue())
                    .build());
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<JobBreakdown> topJobs(Long hrId, LocalDateTime from, LocalDateTime to, int limit) {
        List<Object[]> rows = em.createNativeQuery("""
                SELECT j.id, j.title,
                       COUNT(a.*) AS total,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'SCREENING')    AS scr,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'PHONE_SCREEN') AS ph,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'INTERVIEW')    AS itv,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'OFFER')        AS off,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'HIRED')        AS hir,
                       COUNT(*) FILTER (WHERE a.pipeline_stage = 'REJECTED')     AS rej
                FROM job j
                LEFT JOIN apply_form_user_to_job a
                       ON a.job_id = j.id
                      AND a.time_sent BETWEEN :from AND :to
                WHERE j.posted_by_hr_id = :hr
                GROUP BY j.id, j.title
                ORDER BY total DESC, j.id DESC
                LIMIT :lim
                """)
                .setParameter("hr", hrId)
                .setParameter("from", Timestamp.valueOf(from))
                .setParameter("to", Timestamp.valueOf(to))
                .setParameter("lim", limit)
                .getResultList();

        List<JobBreakdown> result = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            result.add(JobBreakdown.builder()
                    .jobId(((Number) row[0]).longValue())
                    .title((String) row[1])
                    .totalApplications(((Number) row[2]).longValue())
                    .screening(((Number) row[3]).longValue())
                    .phoneScreen(((Number) row[4]).longValue())
                    .interview(((Number) row[5]).longValue())
                    .offer(((Number) row[6]).longValue())
                    .hired(((Number) row[7]).longValue())
                    .rejected(((Number) row[8]).longValue())
                    .build());
        }
        return result;
    }
}
