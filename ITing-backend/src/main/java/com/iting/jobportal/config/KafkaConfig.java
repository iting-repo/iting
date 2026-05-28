package com.iting.jobportal.config;

import com.iting.jobportal.common.event.KafkaTopics;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.util.backoff.ExponentialBackOff;

@Configuration
@EnableKafka
@ConditionalOnProperty(prefix = "spring.kafka", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class KafkaConfig {

  private final KafkaTopics topics;

  @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
  private String brokers;

  @Value("${spring.kafka.consumer.group-id:iting-backend}")
  private String groupId;

  // ---------- Topics ----------

  @Bean
  public NewTopic jobEmbeddingTopic() {
    return TopicBuilder.name(topics.getJobEmbeddingRequested()).partitions(3).replicas(1).build();
  }

  @Bean
  public NewTopic applicationCreatedTopic() {
    return TopicBuilder.name(topics.getApplicationCreated()).partitions(3).replicas(1).build();
  }

  @Bean
  public NewTopic kybReviewCompletedTopic() {
    return TopicBuilder.name(topics.getKybReviewCompleted()).partitions(3).replicas(1).build();
  }

  @Bean
  public NewTopic jobEmbeddingDlq() {
    return TopicBuilder.name(topics.dlqOf(topics.getJobEmbeddingRequested()))
        .partitions(1)
        .replicas(1)
        .build();
  }

  @Bean
  public NewTopic applicationCreatedDlq() {
    return TopicBuilder.name(topics.dlqOf(topics.getApplicationCreated()))
        .partitions(1)
        .replicas(1)
        .build();
  }

  @Bean
  public NewTopic kybReviewCompletedDlq() {
    return TopicBuilder.name(topics.dlqOf(topics.getKybReviewCompleted()))
        .partitions(1)
        .replicas(1)
        .build();
  }

  @Bean
  public NewTopic kybNotificationsTopic() {
    return TopicBuilder.name(topics.getKybNotifications()).partitions(3).replicas(1).build();
  }

  @Bean
  public NewTopic kybNotificationsDlq() {
    return TopicBuilder.name(topics.dlqOf(topics.getKybNotifications()))
        .partitions(1)
        .replicas(1)
        .build();
  }

  // ---------- Producer ----------

  @Bean
  public ProducerFactory<String, Object> producerFactory() {
    Map<String, Object> p = new HashMap<>();
    p.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers);
    p.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    p.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
    p.put(ProducerConfig.ACKS_CONFIG, "all");
    p.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
    p.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
    p.put(ProducerConfig.RETRIES_CONFIG, 10);
    p.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");
    p.put(ProducerConfig.LINGER_MS_CONFIG, 5);
    p.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, true);
    return new DefaultKafkaProducerFactory<>(p);
  }

  @Bean
  public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> pf) {
    return new KafkaTemplate<>(pf);
  }

  // ---------- Consumer ----------

  @Bean
  public ConsumerFactory<String, Object> consumerFactory() {
    Map<String, Object> p = new HashMap<>();
    p.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers);
    p.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
    p.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
    p.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
    p.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
    p.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
    p.put(JsonDeserializer.TRUSTED_PACKAGES, "com.iting.jobportal.*");
    p.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, true);
    p.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    p.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
    p.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 50);
    return new DefaultKafkaConsumerFactory<>(p);
  }

  /**
   * Consumer container with manual ack + DLQ on terminal failures. Retries: 3 attempts with
   * exponential backoff (1s → 2s → 4s), then publish to {topic}.DLT.
   */
  @Bean
  public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory(
      ConsumerFactory<String, Object> cf, KafkaTemplate<String, Object> template) {

    ConcurrentKafkaListenerContainerFactory<String, Object> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(cf);
    factory.setConcurrency(3);
    factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);

    DeadLetterPublishingRecoverer recoverer =
        new DeadLetterPublishingRecoverer(
            template,
            (record, ex) ->
                new org.apache.kafka.common.TopicPartition(
                    record.topic() + topics.getDlqSuffix(), record.partition()));

    ExponentialBackOff backOff = new ExponentialBackOff(1000L, 2.0);
    backOff.setMaxElapsedTime(10_000L);

    DefaultErrorHandler errorHandler = new DefaultErrorHandler(recoverer, backOff);
    errorHandler.addNotRetryableExceptions(IllegalArgumentException.class);
    factory.setCommonErrorHandler(errorHandler);

    return factory;
  }
}
