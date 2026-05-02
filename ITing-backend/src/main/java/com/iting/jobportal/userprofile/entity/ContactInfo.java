package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_info")
@Getter
@Setter
public class ContactInfo {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserProfile profile;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "show_phone_to_recruiter")
    private Boolean showPhoneToRecruiter = false;

    @Column(name = "show_email_to_recruiter")
    private Boolean showEmailToRecruiter = false;
}