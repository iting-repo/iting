package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.CompanyReview;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CompanyReviewResponse {
    private Long id;
    private String authorName;
    private String authorAvatar;
    private int rating;
    private String content;
    private LocalDateTime createdAt;

    public static CompanyReviewResponse fromEntity(CompanyReview review) {
        String name = "Anonymous";
        String avatar = null;

        if (review.getAccount().getUser() != null) {
            name = review.getAccount().getUser().getFullName();
            avatar = review.getAccount().getUser().getAvatarUrl();
        } else if (review.getAccount().getCompany() != null) {
            name = review.getAccount().getCompany().getName();
            avatar = review.getAccount().getCompany().getLogoUrl();
        }

        return CompanyReviewResponse.builder()
                .id(review.getId())
                .authorName(name)
                .authorAvatar(avatar)
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
