package com.iting.jobportal.company.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserFollowCompanyId implements Serializable {
    private Long userId;
    private Long companyId;
}
