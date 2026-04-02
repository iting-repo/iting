package com.iting.jobportal.follow.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class FollowCompanyId implements Serializable {
    private Long userId;
    private Long companyId; // Thay notificationId bằng companyId
}