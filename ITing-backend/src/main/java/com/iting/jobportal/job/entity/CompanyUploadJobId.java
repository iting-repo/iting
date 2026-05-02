package com.iting.jobportal.job.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CompanyUploadJobId implements Serializable {

    private Long jobId;

    private Long companyId;
}