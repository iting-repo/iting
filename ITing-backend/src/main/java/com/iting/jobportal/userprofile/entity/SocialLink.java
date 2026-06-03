package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "SocialLink",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_social_profile_platform",
          columnNames = {"profile_id", "Platform"})
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialLink {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "profile_id", nullable = false)
  @com.fasterxml.jackson.annotation.JsonIgnore
  private UserProfile profile;

  @Enumerated(EnumType.STRING)
  @Column(name = "Platform", length = 50, nullable = false)
  private SocialPlatform platform;

  @Column(name = "Url", columnDefinition = "TEXT", nullable = false)
  private String url;
}
