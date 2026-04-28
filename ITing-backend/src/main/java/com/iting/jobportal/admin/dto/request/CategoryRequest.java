package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    private String name;

    @Size(max = 100, message = "Tên tiếng Anh tối đa 100 ký tự")
    private String nameEn;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    private String description;

    @Size(max = 500, message = "Icon tối đa 500 ký tự")
    private String icon;

    private Long parentId;
}
