package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    /*
    =========================
    USER SEARCH
    =========================
    */

    public static Specification<Job> fromRequest(JobSearchRequest req) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // USER chỉ xem ACTIVE job
            predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {

                String kw = "%" + req.getKeyword().toLowerCase() + "%";

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("position")), kw),
                                cb.like(cb.lower(root.get("description")), kw),
                                cb.like(cb.lower(root.get("techRequired")), kw)
                        )
                );
            }

            if (req.getLocation() != null && !req.getLocation().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("location")),
                                "%" + req.getLocation().toLowerCase() + "%"
                        )
                );
            }

            if (req.getCompanyId() != null) {
                predicates.add(cb.equal(root.get("companyId"), req.getCompanyId()));
            }

            if (req.getJobType() != null) {
                predicates.add(cb.equal(root.get("jobType"), req.getJobType()));
            }

            if (req.getExperienceLevel() != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), req.getExperienceLevel()));
            }

            if (req.getMinSalary() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("maxSalary"),
                                req.getMinSalary()
                        )
                );
            }

            if (req.getMaxSalary() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("minSalary"),
                                req.getMaxSalary()
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /*
    =========================
    ADMIN FILTER
    =========================
    */

    public static Specification<Job> adminFilter(
            JobStatus status,
            Long companyId,
            String keyword,
            String location
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (companyId != null) {
                predicates.add(cb.equal(root.get("companyId"), companyId));
            }

            if (keyword != null && !keyword.isBlank()) {

                String kw = "%" + keyword.toLowerCase() + "%";

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("position")), kw),
                                cb.like(cb.lower(root.get("description")), kw),
                                cb.like(cb.lower(root.get("techRequired")), kw)
                        )
                );
            }

            if (location != null && !location.isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("location")),
                                "%" + location.toLowerCase() + "%"
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}