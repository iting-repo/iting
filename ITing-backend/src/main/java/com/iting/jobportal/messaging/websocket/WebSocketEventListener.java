package com.iting.jobportal.messaging.websocket;

import com.iting.jobportal.messaging.dto.response.PresenceEventResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, Integer> onlineCounters = new ConcurrentHashMap<>();

    private Long extractUserId(Principal principal) {
        if (principal == null) {
            return null;
        }
        try {
            return Long.parseLong(principal.getName());
        } catch (Exception e) {
            return null;
        }
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        log.info("WebSocket connected: {}", user);

        Long userId = extractUserId(user);
        if (userId == null) {
            return;
        }

        int next = onlineCounters.merge(userId, 1, Integer::sum);
        if (next == 1) {
            messagingTemplate.convertAndSend(
                    "/topic/presence",
                    PresenceEventResponse.builder().userId(userId).online(true).build());
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        log.info("WebSocket disconnected: {}", user);

        Long userId = extractUserId(user);
        if (userId == null) {
            return;
        }

        onlineCounters.computeIfPresent(userId, (id, count) -> {
            int next = count - 1;
            if (next <= 0) {
                messagingTemplate.convertAndSend(
                        "/topic/presence",
                        PresenceEventResponse.builder().userId(userId).online(false).build());
                return null;
            }
            return next;
        });
    }
}
