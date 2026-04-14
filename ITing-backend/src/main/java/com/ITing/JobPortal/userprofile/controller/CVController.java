package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.userprofile.dto.response.CVResponse;
import com.iting.jobportal.userprofile.service.CVService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Tag(name = "09.1 CV Management", description = "APIs for managing CVs")
@RestController
@RequestMapping("/api/candidates/cvs")
@RequiredArgsConstructor
public class CVController {

    private final CVService cvService;

    @GetMapping("/recent")
    @Operation(summary = "Lấy 3 CV mới nhất của người dùng", 
               description = "Endpoint này được gọi khi người dùng bấm nút Apply để hiển thị danh sách CV đã upload")
    public ResponseEntity<List<CVResponse>> getRecentCVs(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        List<CVResponse> cvs = cvService.getRecentCVs(userId);
        return ResponseEntity.ok(cvs);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload CV mới", 
               description = "Upload CV mới cho người dùng. Tự động xóa CV cũ nhất nếu vượt quá 3 CVs")
    public ResponseEntity<CVResponse> uploadCV(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        try {
            CVResponse response = cvService.uploadCV(userId, file, title);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count")
    @Operation(summary = "Kiểm tra số lượng CV đã upload")
    public ResponseEntity<Map<String, Object>> getCVCount(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        List<CVResponse> cvs = cvService.getRecentCVs(userId);
        return ResponseEntity.ok(Map.of(
                "count", cvs.size(),
                "maxAllowed", 3,
                "hasReachedLimit", cvs.size() >= 3
        ));
    }
}
