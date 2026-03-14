package com.iting.jobportal.job.entity;

import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.company.entity.Company;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Company_upload_job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyUploadJob {

    @EmbeddedId
    private CompanyUploadJobId id; // Khóa chính tổ hợp (JobId + CompanyId)

    @ManyToOne
    @MapsId("jobId")
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @MapsId("companyId")
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin approvedBy; // Admin nào đã duyệt/thực hiện upload

    @Column(name = "time")
    private LocalDateTime uploadTime;

    @Column(name = "status")
    private String status;

    @Column(name = "note")
    private String note;
}