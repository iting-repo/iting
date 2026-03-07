package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications cho JobRepository.
 * Giải quyết vấn đề Hibernate không biết kiểu dữ liệu khi truyền null cho enum parameter.
 */
public class JobSpecification {

    /** Chỉ lấy jobs đang ACTIVE */
    public static Specification<Job> hasStatus(JobStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    /** Tổng hợp tất cả điều kiện tìm kiếm từ JobSearchRequest */
    public static Specification<Job> fromRequest(JobSearchRequest req) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Chỉ lấy ACTIVE
            predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

            // Keyword: tìm trong position hoặc description
            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                String kw = "%" + req.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("position")), kw),
                        cb.like(cb.lower(root.get("description")), kw)
                ));
            }

            // Location
            if (req.getLocation() != null && !req.getLocation().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("location")),
                        "%" + req.getLocation().toLowerCase() + "%"
                ));
            }

            // Salary range
            if (req.getMinSalary() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxSalary"), req.getMinSalary()));
            }
            if (req.getMaxSalary() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("minSalary"), req.getMaxSalary()));
            }

            // Tech required
            if (req.getTechRequired() != null && !req.getTechRequired().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("techRequired")),
                        "%" + req.getTechRequired().toLowerCase() + "%"
                ));
            }

            // Company ID
            if (req.getCompanyId() != null) {
                predicates.add(cb.equal(root.get("companyId"), req.getCompanyId()));
            }

            // JobType (enum — type-safe, no null binding issue)
            if (req.getJobType() != null) {
                predicates.add(cb.equal(root.get("jobType"), req.getJobType()));
            }

            // ExperienceLevel (enum — type-safe, no null binding issue)
            if (req.getExperienceLevel() != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), req.getExperienceLevel()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
