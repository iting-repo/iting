package com.iting.jobportal.debug;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public final class DebugSessionLogger {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Path LOG_PATH = Path.of("debug-89f4ab.log");
    private static final String SESSION_ID = "89f4ab";

    private DebugSessionLogger() {
    }

    public static void log(String runId, String hypothesisId, String location, String message, Map<String, Object> data) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sessionId", SESSION_ID);
        payload.put("id", "log_" + System.currentTimeMillis() + "_" + UUID.randomUUID());
        payload.put("timestamp", System.currentTimeMillis());
        payload.put("location", location);
        payload.put("message", message);
        payload.put("data", data == null ? Map.of() : data);
        payload.put("runId", runId);
        payload.put("hypothesisId", hypothesisId);

        try {
            Files.writeString(
                    LOG_PATH,
                    OBJECT_MAPPER.writeValueAsString(payload) + System.lineSeparator(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND);
        } catch (IOException ignored) {
            // Best-effort debug logging only.
        }
    }
}
