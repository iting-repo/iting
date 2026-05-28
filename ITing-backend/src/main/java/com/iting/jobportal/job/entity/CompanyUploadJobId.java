package com.iting.jobportal.job.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.*;

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
