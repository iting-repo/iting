package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.UserReport;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class UserReportSpecification {
    public static Specification<UserReport> getReportsSpec(String status, String type, String targetType, String priority, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status)) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (type != null && !type.isEmpty() && !"all".equalsIgnoreCase(type)) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            if (targetType != null && !targetType.isEmpty() && !"all".equalsIgnoreCase(targetType)) {
                predicates.add(criteriaBuilder.equal(root.get("targetType"), targetType));
            }
            if (priority != null && !priority.isEmpty() && !"all".equalsIgnoreCase(priority)) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }
            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate idPredicate = null;
                try {
                    Long id = Long.parseLong(search);
                    idPredicate = criteriaBuilder.equal(root.get("id"), id);
                } catch (NumberFormatException ignored) {}

                Predicate targetNamePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("targetName")), searchPattern);
                
                if (idPredicate != null) {
                    predicates.add(criteriaBuilder.or(idPredicate, targetNamePredicate));
                } else {
                    predicates.add(targetNamePredicate);
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
