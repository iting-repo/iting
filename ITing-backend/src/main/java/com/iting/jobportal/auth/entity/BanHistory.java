package com.iting.jobportal.auth.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ban_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_account_id", nullable = false)
    private Account targetAccount; // Tài khoản bị cấm

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_account_id", nullable = false)
    private Account adminAccount; // Admin thực hiện lệnh cấm

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime bannedAt;
    private LocalDateTime expiredAt; // NULL nếu cấm vĩnh viễn

    @Column(nullable = false)
    private Boolean isActive = true; // Lệnh cấm này còn hiệu lực hay không

    @PrePersist
    protected void onCreate() {
        bannedAt = LocalDateTime.now();
    }
}