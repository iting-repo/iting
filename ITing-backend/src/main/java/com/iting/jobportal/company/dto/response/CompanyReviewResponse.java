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
        }
        // NOTE: Sau Phase 2, Account không còn @OneToOne với Company. EMPLOYER account
        // resolve company qua company_hr_affiliations. Reviewer thường là CANDIDATE
        // nên User branch ở trên đã đủ; nếu cần hiển thị reviewer là HR, lookup qua
        // affiliation ở service layer thay vì DTO.

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
