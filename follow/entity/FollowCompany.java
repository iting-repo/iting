package com.iting.jobportal.follow.entity;

import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.notification.entity.Notification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_follow_company")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FollowCompany {

    @EmbeddedId
    private FollowCompanyId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("companyId") // Đưa Company vào làm một phần của khóa chính
    @JoinColumn(name = "company_id")
    private Company company;

//    @ManyToOne // Notification giờ chỉ là một quan hệ phụ, không bắt buộc làm PK
//    @JoinColumn(name = "notification_id")
//    private Notification notification;

    @Column(name = "follow_date")
    private LocalDateTime followDate;
}