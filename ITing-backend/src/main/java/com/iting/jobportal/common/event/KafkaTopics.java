package com.iting.jobportal.common.event;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class KafkaTopics {

    @Value("${app.kafka.topics.job-embedding-requested:job.embedding.requested.v1}")
    private String jobEmbeddingRequested;

    @Value("${app.kafka.topics.application-created:application.created.v1}")
    private String applicationCreated;

    @Value("${app.kafka.topics.kyb-review-completed:kyb.review.completed.v1}")
    private String kybReviewCompleted;

    @Value("${app.kafka.topics.kyb-notifications:kyb-notifications}")
    private String kybNotifications;

    @Value("${app.kafka.dlq-suffix:.DLT}")
    private String dlqSuffix;

    public String dlqOf(String topic) { return topic + dlqSuffix; }
}
