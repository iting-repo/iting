package com.iting.jobportal.company.entity;

import java.io.Serializable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserFollowCompanyId implements Serializable {
  private Long userId;
  private Long companyId;
}
