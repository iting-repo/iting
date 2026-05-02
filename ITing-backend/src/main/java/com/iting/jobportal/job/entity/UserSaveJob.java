package com.iting.jobportal.job.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "user_save_job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserSaveJob.UserSaveJobId.class)
public class UserSaveJob {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSaveJobId implements Serializable {
        private Long userId;
        private Long jobId;

        @Override
        public boolean equals(Object o) {
            if (this == o)
                return true;
            if (o == null || getClass() != o.getClass())
                return false;
            UserSaveJobId that = (UserSaveJobId) o;
            return Objects.equals(userId, that.userId) && Objects.equals(jobId, that.jobId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, jobId);
        }
    }
}
