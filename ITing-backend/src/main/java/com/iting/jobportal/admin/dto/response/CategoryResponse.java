package com.iting.jobportal.admin.dto.response;

import com.iting.jobportal.admin.entity.Category;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {

  private Long id;
  private String type;
  private String name;
  private String nameEn;
  private String description;
  private String icon;
  private Long parentId;
  private Integer sortOrder;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static CategoryResponse fromEntity(Category entity) {
    return CategoryResponse.builder()
        .id(entity.getId())
        .type(entity.getType())
        .name(entity.getName())
        .nameEn(entity.getNameEn())
        .description(entity.getDescription())
        .icon(entity.getIcon())
        .parentId(entity.getParentId())
        .sortOrder(entity.getSortOrder())
        .active(entity.getActive())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .build();
  }
}
