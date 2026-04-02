package com.iting.jobportal.company.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_follow_company")
@IdClass(UserFollowCompanyId.class)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFollowCompany {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "follow_date")
    private java.time.LocalDateTime followDate;

    @PrePersist
    protected void onCreate() {
        if (followDate == null) {
            followDate = java.time.LocalDateTime.now();
        }
    }
}
