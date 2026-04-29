package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByTypeAndActiveOrderBySortOrderAsc(String type, Boolean active);
    
    List<Category> findByTypeOrderBySortOrderAsc(String type);
    
    List<Category> findByParentIdOrderBySortOrderAsc(Long parentId);
    
    boolean existsByTypeAndName(String type, String name);

    boolean existsByTypeAndNameAndIdNot(String type, String name, Long id);

    long countByType(String type);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(c.sortOrder), 0) FROM Category c WHERE c.type = :type")
    int findMaxSortOrderByType(@org.springframework.data.repository.query.Param("type") String type);
}

