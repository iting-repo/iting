package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByTypeAndActiveOrderBySortOrderAsc(String type, Boolean active);
    
    List<Category> findByTypeOrderBySortOrderAsc(String type);
    
    List<Category> findByParentIdOrderBySortOrderAsc(Long parentId);
    
    boolean existsByTypeAndName(String type, String name);
}

