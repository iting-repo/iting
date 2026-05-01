package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.company.entity.Company;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import com.iting.jobportal.job.entity.enums.JobStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    /*
     * =========================
     * USER SEARCH
     * =========================
     */

    public static Specification<Job> fromRequest(JobSearchRequest req) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // USER chỉ xem ACTIVE job
            predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

            // CHỈ XEM JOB CÒN HẠN: dueDate >= hôm nay hoặc dueDate là null
            predicates.add(cb.or(
                    cb.isNull(root.get("dueDate")),
                    cb.greaterThanOrEqualTo(root.get("dueDate"), java.time.LocalDate.now())));

            // Join company to allow filtering by company fields (industry/domain)
            Join<Job, Company> companyJoin = root.join("company", JoinType.LEFT);
            // Ensure distinct when joining
            query.distinct(true);

            // CHỈ HIỂN THỊ JOB CỦA CÔNG TY ĐANG HOẠT ĐỘNG
            predicates.add(cb.equal(companyJoin.get("active"), true));

            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                String[] tokens = req.getKeyword().trim().toLowerCase().split("\\s+");
                List<Predicate> keywordPredicates = new ArrayList<>();

                for (String token : tokens) {
                    if (token.length() < 2)
                        continue;
                    String kw = "%" + token + "%";
                    keywordPredicates.add(cb.or(
                            cb.like(cb.lower(root.get("position")), kw),
                            cb.like(cb.lower(root.get("description")), kw),
                            cb.like(cb.lower(root.get("skills")), kw)));
                }

                if (!keywordPredicates.isEmpty()) {
                    predicates.add(cb.and(keywordPredicates.toArray(new Predicate[0])));
                }
            }

            if (req.getLocation() != null && !req.getLocation().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("location")),
                                "%" + req.getLocation().toLowerCase() + "%"));
            }

            if (req.getCompanyId() != null) {
                predicates.add(cb.equal(companyJoin.get("id"), req.getCompanyId()));
            }

            if (req.getJobType() != null) {
                predicates.add(cb.equal(root.get("jobType"), req.getJobType()));
            }

            if (req.getJobTypes() != null && !req.getJobTypes().isEmpty()) {
                predicates.add(root.get("jobType").in(req.getJobTypes()));
            }

            if (req.getExperienceLevel() != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), req.getExperienceLevel()));
            }

            if (req.getExperienceLevels() != null && !req.getExperienceLevels().isEmpty()) {
                predicates.add(root.get("experienceLevel").in(req.getExperienceLevels()));
            }

            if (req.getMinSalary() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("maxSalary"),
                                req.getMinSalary()));
            }

            if (req.getMaxSalary() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("minSalary"),
                                req.getMaxSalary()));
            }

            if (req.getPostedWithinHours() != null && req.getPostedWithinHours() > 0) {
                LocalDateTime fromTime = LocalDateTime.now().minusHours(req.getPostedWithinHours());
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromTime));
            }

            // -------------------------
            // DOMAIN / SUBDOMAIN / TECH filters (deep filter for domain IT)
            // -------------------------

            // Single domain keyword - match against company's industry
            if (req.getDomain() != null && !req.getDomain().isBlank()) {
                String d = "%" + req.getDomain().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(companyJoin.get("industry")), d));
            }

            // Sub-domains: match against company.industry, job.position or skills
            if (req.getSubDomains() != null && !req.getSubDomains().isEmpty()) {
                List<Predicate> subPreds = new ArrayList<>();
                for (String sub : req.getSubDomains()) {
                    if (sub == null)
                        continue;
                    String s = "%" + sub.trim().toLowerCase() + "%";
                    subPreds.add(cb.like(cb.lower(companyJoin.get("industry")), s));
                    subPreds.add(cb.like(cb.lower(root.get("position")), s));
                    subPreds.add(cb.like(cb.lower(root.get("skills")), s));
                }
                if (!subPreds.isEmpty()) {
                    predicates.add(cb.or(subPreds.toArray(new Predicate[0])));
                }
            }

            // Techs: allow searching for multiple tech keywords across skills and position
            if (req.getTechs() != null && !req.getTechs().isEmpty()) {
                List<Predicate> techPreds = new ArrayList<>();
                for (String tech : req.getTechs()) {
                    if (tech == null)
                        continue;
                    String t = "%" + tech.trim().toLowerCase() + "%";
                    techPreds.add(cb.like(cb.lower(root.get("skills")), t));
                    techPreds.add(cb.like(cb.lower(root.get("position")), t));
                }
                if (!techPreds.isEmpty()) {
                    predicates.add(cb.or(techPreds.toArray(new Predicate[0])));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /*
     * =========================
     * ADMIN FILTER
     * =========================
     */

    public static Specification<Job> adminFilter(
            JobStatus status,
            Long companyId,
            String keyword,
            String location) {

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
                                cb.like(cb.lower(root.get("skills")), kw)));
            }

            if (location != null && !location.isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("location")),
                                "%" + location.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
