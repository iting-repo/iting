package com.iting.jobportal.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_follow_company")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserFollowCompany.UserFollowCompanyId.class)
public class UserFollowCompany {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "notification_id")
    private Integer notificationId;

    @Column(name = "follow_date")
    private LocalDateTime followDate;

    @PrePersist
    protected void onCreate() {
        if (followDate == null) {
            followDate = LocalDateTime.now();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserFollowCompanyId implements Serializable {
        private Long userId;
        private Long companyId;
    }
}
