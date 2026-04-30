package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Banner extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String position;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "image_desktop", length = 500)
    private String imageDesktop;

    @Column(name = "image_mobile", length = 500)
    private String imageMobile;

    @Column(length = 500)
    private String link;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    private Integer priority;

    @Column(nullable = false, length = 20)
    private String status;

    @PrePersist
    protected void onCreate() {
        if (priority == null)
            priority = 0;
        if (status == null)
            status = "ACTIVE";
    }
}
