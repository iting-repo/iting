package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Certificate")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "Title", length = 255)
    private String title;

    @Column(name = "Issuing_organization", length = 255)
    private String issuingOrganization;

    @Column(name = "Issue_date")
    private LocalDate issueDate;

    @Column(name = "Expiration_date")
    private LocalDate expirationDate;

    @Column(name = "Credential_id", length = 255)
    private String credentialId;

    @Column(name = "Credential_url", columnDefinition = "TEXT")
    private String credentialUrl;

    @Column(name = "Does_not_expire")
    private Boolean doesNotExpire;
}
