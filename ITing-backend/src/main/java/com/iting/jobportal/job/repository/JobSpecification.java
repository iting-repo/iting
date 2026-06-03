package com.iting.jobportal.job.repository;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class JobSpecification {

  /*
  =========================
  USER SEARCH
  =========================
  */

  public static Specification<Job> fromRequest(JobSearchRequest req) {
    // Extract fields to avoid closure evaluating modified request fields later
    final var reqKeyword = req.getKeyword();
    final var reqLocation = req.getLocation();
    final var reqCompanyId = req.getCompanyId();
    final var reqJobType = req.getJobType();
    final var reqJobTypes = req.getJobTypes();
    final var reqExperienceLevel = req.getExperienceLevel();
    final var reqExperienceLevels = req.getExperienceLevels();
    final var reqMinSalary = req.getMinSalary();
    final var reqMaxSalary = req.getMaxSalary();
    final var reqPostedWithinHours = req.getPostedWithinHours();
    final var reqDomain = req.getDomain();
    final var reqSubDomains = req.getSubDomains();
    final var reqTechs = req.getTechs();

    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();

      // USER chỉ xem ACTIVE job
      predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

      // CHỈ XEM JOB CÒN HẠN: dueDate >= hôm nay hoặc dueDate là null
      predicates.add(
          cb.or(
              cb.isNull(root.get("dueDate")),
              cb.greaterThanOrEqualTo(root.get("dueDate"), java.time.LocalDate.now())));

      // Join company to allow filtering by company fields (industry/domain)
      Join<Job, Company> companyJoin = root.join("company", JoinType.LEFT);
      // Ensure distinct when joining
      query.distinct(true);

      // CHỈ HIỂN THỊ JOB CỦA CÔNG TY ĐANG HOẠT ĐỘNG
      predicates.add(cb.equal(companyJoin.get("active"), true));

      if (reqKeyword != null && !reqKeyword.isBlank()) {
        // Strip special chars (parentheses, brackets, etc.) before tokenizing
        String sanitized =
            reqKeyword
                .trim()
                .toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\p{L}\\s\\-]", " "); // keep letters, digits, hyphens
        String[] tokens = sanitized.split("\\s+");
        List<Predicate> keywordPredicates = new ArrayList<>();

        for (String token : tokens) {
          if (token.length() < 2) continue;
          String kw = "%" + token + "%";
          keywordPredicates.add(
              cb.or(
                  cb.like(cb.lower(root.get("title")), kw),
                  cb.like(cb.lower(root.get("position")), kw),
                  cb.like(cb.lower(root.get("description")), kw),
                  cb.like(cb.lower(root.get("skills").as(String.class)), kw)));
        }

        if (!keywordPredicates.isEmpty()) {
          predicates.add(cb.and(keywordPredicates.toArray(new Predicate[0])));
        }
      }

      if (reqLocation != null && !reqLocation.isBlank()) {

        predicates.add(
            cb.like(cb.lower(root.get("location")), "%" + reqLocation.toLowerCase() + "%"));
      }

      if (reqCompanyId != null) {
        predicates.add(cb.equal(companyJoin.get("id"), reqCompanyId));
      }

      if (reqJobType != null) {
        predicates.add(cb.equal(root.get("jobType"), reqJobType));
      }

      if (reqJobTypes != null && !reqJobTypes.isEmpty()) {
        predicates.add(root.get("jobType").in(reqJobTypes));
      }

      if (reqExperienceLevel != null) {
        predicates.add(cb.equal(root.get("experienceLevel"), reqExperienceLevel));
      }

      if (reqExperienceLevels != null && !reqExperienceLevels.isEmpty()) {
        predicates.add(root.get("experienceLevel").in(reqExperienceLevels));
      }

      if (reqMinSalary != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("maxSalary"), reqMinSalary));
      }

      if (reqMaxSalary != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("minSalary"), reqMaxSalary));
      }

      if (reqPostedWithinHours != null && reqPostedWithinHours > 0) {
        LocalDateTime fromTime = LocalDateTime.now().minusHours(reqPostedWithinHours);
        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromTime));
      }

      // -------------------------
      // DOMAIN / SUBDOMAIN / TECH filters (deep filter for domain IT)
      // -------------------------

      // Single domain keyword - match against company's industry
      if (reqDomain != null && !reqDomain.isBlank()) {
        String d = "%" + reqDomain.toLowerCase() + "%";
        predicates.add(cb.like(cb.lower(companyJoin.get("industry")), d));
      }

      // Sub-domains: match against company.industry, job.position or skills
      if (reqSubDomains != null && !reqSubDomains.isEmpty()) {
        List<Predicate> subPreds = new ArrayList<>();
        for (String sub : reqSubDomains) {
          if (sub == null) continue;
          String s = "%" + sub.trim().toLowerCase() + "%";
          subPreds.add(cb.like(cb.lower(companyJoin.get("industry")), s));
          subPreds.add(cb.like(cb.lower(root.get("position")), s));
          subPreds.add(cb.like(cb.lower(root.get("skills").as(String.class)), s));
        }
        if (!subPreds.isEmpty()) {
          predicates.add(cb.or(subPreds.toArray(new Predicate[0])));
        }
      }

      // Techs: allow searching for multiple tech keywords across skills and position
      if (reqTechs != null && !reqTechs.isEmpty()) {
        List<Predicate> techPreds = new ArrayList<>();
        for (String tech : reqTechs) {
          if (tech == null) continue;
          String t = "%" + tech.trim().toLowerCase() + "%";
          techPreds.add(cb.like(cb.lower(root.get("skills").as(String.class)), t));
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
  =========================
  ADMIN FILTER
  =========================
  */

  public static Specification<Job> adminFilter(
      JobStatus status, Long companyId, String keyword, String location) {

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
                cb.like(cb.lower(root.get("skills").as(String.class)), kw)));
      }

      if (location != null && !location.isBlank()) {

        predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
