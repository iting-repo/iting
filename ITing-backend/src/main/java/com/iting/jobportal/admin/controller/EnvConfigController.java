package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.EnvConfigRequest;
import com.iting.jobportal.admin.entity.EnvConfig;
import com.iting.jobportal.admin.repository.EnvConfigRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/env-config")
@RequiredArgsConstructor
@Tag(name = "Environment Configuration", description = "Admin APIs for managing dynamic environment variables")
public class EnvConfigController {

    private final EnvConfigRepository envConfigRepository;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * Lấy tất cả biến môi trường, nhóm theo envGroup.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all environment variables grouped")
    public ResponseEntity<List<EnvConfig>> getAll() {
        List<EnvConfig> configs = envConfigRepository.findAllByOrderByEnvGroupAscEnvKeyAsc();

        // Mask giá trị nhạy cảm khi trả về
        configs.forEach(c -> {
            if (Boolean.TRUE.equals(c.getSensitive()) && c.getEnvValue() != null && c.getEnvValue().length() > 4) {
                c.setEnvValue("••••" + c.getEnvValue().substring(c.getEnvValue().length() - 4));
            }
        });

        return ResponseEntity.ok(configs);
    }

    /**
     * Lấy giá trị đầy đủ (không mask) của một biến cụ thể — để admin xem khi cần.
     */
    @GetMapping("/{id}/reveal")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reveal full value of a sensitive variable")
    public ResponseEntity<Map<String, String>> revealValue(@PathVariable Long id) {
        return envConfigRepository.findById(id)
                .map(c -> ResponseEntity.ok(Map.of("envKey", c.getEnvKey(), "envValue", c.getEnvValue() != null ? c.getEnvValue() : "")))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Tạo biến môi trường mới.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new environment variable")
    public ResponseEntity<?> create(@RequestBody EnvConfigRequest req, HttpServletRequest request) {
        if (envConfigRepository.existsByEnvKey(req.getEnvKey())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Biến '" + req.getEnvKey() + "' đã tồn tại"));
        }

        Long adminId = jwtTokenUtil.getUserIdFromHeader(request);

        EnvConfig config = EnvConfig.builder()
                .envKey(req.getEnvKey().toUpperCase().trim())
                .envValue(req.getEnvValue())
                .envGroup(req.getEnvGroup() != null ? req.getEnvGroup() : "app")
                .description(req.getDescription())
                .sensitive(req.getSensitive() != null ? req.getSensitive() : false)
                .valueType(req.getValueType() != null ? req.getValueType() : "string")
                .lastUpdatedBy(adminId)
                .build();

        return ResponseEntity.ok(envConfigRepository.save(config));
    }

    /**
     * Cập nhật giá trị biến môi trường.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an environment variable")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EnvConfigRequest req, HttpServletRequest request) {
        return envConfigRepository.findById(id).map(existing -> {
            Long adminId = jwtTokenUtil.getUserIdFromHeader(request);

            // Nếu gửi giá trị masked (bắt đầu bằng ••••), không cập nhật giá trị
            if (req.getEnvValue() != null && !req.getEnvValue().startsWith("••••")) {
                existing.setEnvValue(req.getEnvValue());
            }

            if (req.getDescription() != null) existing.setDescription(req.getDescription());
            if (req.getEnvGroup() != null) existing.setEnvGroup(req.getEnvGroup());
            if (req.getSensitive() != null) existing.setSensitive(req.getSensitive());
            if (req.getValueType() != null) existing.setValueType(req.getValueType());
            existing.setLastUpdatedBy(adminId);

            return ResponseEntity.ok(envConfigRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Xóa biến môi trường.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Operation(summary = "Delete an environment variable")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!envConfigRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        envConfigRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Khởi tạo các biến mặc định từ .env.example nếu bảng rỗng.
     */
    @PostMapping("/seed")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Seed default environment variables")
    public ResponseEntity<List<EnvConfig>> seedDefaults(HttpServletRequest request) {
        if (envConfigRepository.count() > 0) {
            return ResponseEntity.ok(envConfigRepository.findAllByOrderByEnvGroupAscEnvKeyAsc());
        }

        Long adminId = jwtTokenUtil.getUserIdFromHeader(request);

        List<EnvConfig> defaults = List.of(
            env("AWS_ACCESS_KEY", "", "aws", "AWS Access Key ID", true, "string", adminId),
            env("AWS_SECRET_KEY", "", "aws", "AWS Secret Access Key", true, "string", adminId),
            env("AWS_REGION", "ap-southeast-2", "aws", "Vùng AWS (ap-southeast-1, us-east-1...)", false, "string", adminId),
            env("AWS_S3_BUCKET", "datn-jobweb", "aws", "Tên S3 bucket lưu file", false, "string", adminId),
            env("AWS_ENABLED", "true", "aws", "Bật/tắt tính năng AWS S3", false, "boolean", adminId),

            env("GEMINI_API_KEY", "", "ai", "API Key của Google Gemini AI", true, "string", adminId),
            env("OPENAI_API_KEY", "", "ai", "API Key của OpenAI (cho embedding)", true, "string", adminId),
            env("OPENAI_BASE_URL", "https://api.openai.com", "ai", "Base URL OpenAI API", false, "url", adminId),
            env("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small", "ai", "Mô hình embedding OpenAI", false, "string", adminId),
            env("ML_SERVICE_URL", "http://localhost:8000", "ai", "URL dịch vụ ML (Python FastAPI)", false, "url", adminId),
            env("ML_SERVICE_ENABLED", "true", "ai", "Bật/tắt tính năng ML Service", false, "boolean", adminId),

            env("REDIS_ENABLED", "false", "redis", "Bật/tắt Redis cache", false, "boolean", adminId),
            env("REDIS_HOST", "localhost", "redis", "Địa chỉ Redis server", false, "string", adminId),
            env("REDIS_PORT", "6379", "redis", "Port Redis", false, "number", adminId),
            env("REDIS_PASSWORD", "", "redis", "Mật khẩu Redis", true, "string", adminId),
            env("REDIS_DATABASE", "0", "redis", "Redis database index", false, "number", adminId),

            env("KAFKA_BROKERS", "localhost:9092", "kafka", "Kafka bootstrap servers", false, "string", adminId),

            env("GOOGLE_CLIENT_SECRET", "", "auth", "Google OAuth2 client secret", true, "string", adminId)
        );

        List<EnvConfig> saved = envConfigRepository.saveAll(defaults);
        return ResponseEntity.ok(saved);
    }

    private EnvConfig env(String key, String value, String group, String desc, boolean sensitive, String type, Long adminId) {
        return EnvConfig.builder()
                .envKey(key)
                .envValue(value)
                .envGroup(group)
                .description(desc)
                .sensitive(sensitive)
                .valueType(type)
                .lastUpdatedBy(adminId)
                .build();
    }
}
