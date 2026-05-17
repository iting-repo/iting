package com.iting.jobportal.messaging.relay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Wire format for cross-instance WebSocket fan-out via Redis Pub/Sub.
 * {@code originId} prevents the publisher from re-delivering its own message locally.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WsBroadcastEnvelope implements Serializable {
    private String originId;
    private String type;          // "user" or "topic"
    private String userId;        // when type == "user"
    private String destination;   // STOMP destination, e.g. "/queue/notifications" or "/topic/job/123"
    private Object payload;

    public static WsBroadcastEnvelope toUser(String origin, String userId, String destination, Object payload) {
        return WsBroadcastEnvelope.builder()
                .originId(origin).type("user").userId(userId)
                .destination(destination).payload(payload).build();
    }

    public static WsBroadcastEnvelope toTopic(String origin, String destination, Object payload) {
        return WsBroadcastEnvelope.builder()
                .originId(origin).type("topic")
                .destination(destination).payload(payload).build();
    }

    public static String newOrigin() { return UUID.randomUUID().toString(); }
}
