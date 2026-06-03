package com.iting.jobportal.messaging.relay;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Cross-instance WebSocket sender. Use this instead of {@link SimpMessagingTemplate} directly
 * whenever the recipient may be connected to a sibling instance.
 *
 * <p>Behavior: {@link RelayPublisher} present → publishes to Redis; every instance (including this
 * one) consumes and dispatches locally absent → falls back to local SimpMessagingTemplate
 * (single-instance mode)
 *
 * <p>The publisher is only created when {@code app.cluster.messaging.enabled=true} AND a {@link
 * RedisTemplate} bean exists (i.e. {@code app.redis.enabled=true}).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClusterMessagingTemplate {

  private final SimpMessagingTemplate local;
  private final Optional<RelayPublisher> relay;

  public void convertAndSendToUser(String userId, String destination, Object payload) {
    if (relay.isPresent()) {
      relay
          .get()
          .publish(
              WsBroadcastEnvelope.toUser(relay.get().originId(), userId, destination, payload));
    } else {
      local.convertAndSendToUser(userId, destination, payload);
    }
  }

  public void convertAndSend(String destination, Object payload) {
    if (relay.isPresent()) {
      relay
          .get()
          .publish(WsBroadcastEnvelope.toTopic(relay.get().originId(), destination, payload));
    } else {
      local.convertAndSend(destination, payload);
    }
  }

  @Component
  @RequiredArgsConstructor
  @ConditionalOnProperty(prefix = "app.cluster.messaging", name = "enabled", havingValue = "true")
  @ConditionalOnBean(RedisTemplate.class)
  public static class RelayPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final String originId = WsBroadcastEnvelope.newOrigin();

    @Value("${app.cluster.messaging.channel:iting:ws:broadcast}")
    private String channel;

    public String originId() {
      return originId;
    }

    public String channel() {
      return channel;
    }

    public void publish(WsBroadcastEnvelope env) {
      redisTemplate.convertAndSend(channel, env);
    }
  }
}
