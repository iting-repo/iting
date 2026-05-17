package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Lưu trữ các biến môi trường (environment variables) cho hệ thống.
 * Admin có thể cấu hình động từ giao diện web thay vì sửa file .env thủ công.
 *
 * Mỗi biến được phân nhóm (group) để dễ quản lý và hiển thị trên UI.
 */
@Entity
@Table(name = "env_configs", uniqueConstraints = {
    @UniqueConstraint(columnNames = "envKey")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tên biến môi trường — ví dụ: AWS_ACCESS_KEY, GEMINI_API_KEY */
    @Column(nullable = false, unique = true, length = 128)
    private String envKey;

    /** Giá trị biến — có thể chứa API keys, URLs, passwords... */
    @Column(columnDefinition = "TEXT")
    private String envValue;

    /** Nhóm phân loại — database, aws, email, ai, redis, kafka, app */
    @Column(length = 32)
    private String envGroup;

    /** Mô tả ngắn cho admin hiểu biến này dùng để làm gì */
    @Column(length = 512)
    private String description;

    /** Đánh dấu biến nhạy cảm (mật khẩu, API key) — UI sẽ mask giá trị */
    @Builder.Default
    private Boolean sensitive = false;

    /** Kiểu dữ liệu gợi ý: string, number, boolean, url, email */
    @Column(length = 16)
    @Builder.Default
    private String valueType = "string";

    /** Admin cuối cùng thay đổi */
    private Long lastUpdatedBy;

    private LocalDateTime lastUpdate;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.lastUpdate = LocalDateTime.now();
    }
}
