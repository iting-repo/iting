package com.iting.jobportal.userprofile.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contact_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactInfo {

    @Id
    private Long userId;

    private String phone;
    private String email;
}
