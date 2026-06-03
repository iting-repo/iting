package com.iting.jobportal.messaging.relay;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.Topic;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Receives {@link WsBroadcastEnvelope} from Redis Pub/Sub and re-emits to the local STOMP broker.
 * Only active when both cluster messaging and Redis infra are enabled.
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.cluster.messaging", name = "enabled", havingValue = "true")
@ConditionalOnBean(RedisMessageListenerContainer.class)
@Slf4j
public class WsBroadcastSubscriber implements MessageListener {

  private final RedisMessageListenerContainer container;
  private final SimpMessagingTemplate local;
  private final GenericJackson2JsonRedisSerializer redisJsonSerializer;
  private final ClusterMessagingTemplate.RelayPublisher publisher;

  @Value("${app.cluster.messaging.channel:iting:ws:broadcast}")
  private String channel;

  @PostConstruct
  void subscribe() {
    Topic topic = new ChannelTopic(channel);
    container.addMessageListener(this, topic);
    log.info(
        "WsBroadcastSubscriber listening on Redis channel '{}', originId={}",
        channel,
        publisher.originId());
  }

  @Override
  public void onMessage(Message message, byte[] pattern) {
    try {
      WsBroadcastEnvelope env =
          (WsBroadcastEnvelope) redisJsonSerializer.deserialize(message.getBody());
      if (env == null) return;
      if ("user".equals(env.getType())) {
        local.convertAndSendToUser(env.getUserId(), env.getDestination(), env.getPayload());
      } else {
        local.convertAndSend(env.getDestination(), env.getPayload());
      }
    } catch (Exception e) {
      log.warn("Failed to dispatch WS broadcast: {}", e.getMessage());
    }
  }
}
