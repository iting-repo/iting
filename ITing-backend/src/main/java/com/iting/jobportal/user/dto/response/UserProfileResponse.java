package com.iting.jobportal.user.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {
  private Long userId;
  private String fullName;
  private String email;
  private String phoneNum;
  private Long locId;
  private String avatarUrl;
  private LocalDateTime lastUpdate;
}
