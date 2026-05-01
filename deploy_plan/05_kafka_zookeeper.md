# Task 05: Kafka & Zookeeper

## Objective

Deploy Apache Kafka with Zookeeper as Docker containers for the event-driven messaging system used by the ITing backend for job notifications, chat, and real-time features.

## Prerequisites

- Task 02 completed (Docker foundation, iting-net network, volumes)
- Task 04 completed (Redis running - some services depend on both)

## Step-by-Step Instructions

### 5.1 Create Kafka Configuration

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

# Kafka server.properties for production optimization
cat > ./deploy/config/kafka/server.properties << 'EOF'
# ITing Kafka Configuration
# Single-node production setup

# Broker settings
broker.id=1
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# Log settings
num.partitions=3
num.recovery.threads.per.data.dir=1
log.retention.hours=168
log.retention.check.interval.ms=300000
log.segment.bytes=1073741824

# Replication (single node = 1)
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1

# Auto topic creation
auto.create.topics.enable=true

# Cleanup policy
log.cleanup.policy=delete
EOF
```

### 5.2 Add Kafka and Zookeeper Services to docker-compose.yml

```bash
cat >> ./deploy/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Zookeeper - Kafka dependency
  # ========================================
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    container_name: iting-zookeeper
    restart: unless-stopped
    networks:
      - iting-net
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
      ZOOKEEPER_LOG4J_ROOT_LOGLEVEL: WARN
    volumes:
      - iting_zookeeper_data:/var/lib/zookeeper/data
      - iting_zookeeper_data:/var/lib/zookeeper/log
    healthcheck:
      test: ["CMD-SHELL", "echo ruok | nc localhost 2181 | grep imok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # ========================================
  # Kafka - Event Streaming
  # ========================================
  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: iting-kafka
    restart: unless-stopped
    depends_on:
      zookeeper:
        condition: service_healthy
    networks:
      - iting-net
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_LOG_RETENTION_HOURS: 168
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_NUM_PARTITIONS: 3
      KAFKA_LOG4J_ROOT_LOGLEVEL: WARN
    volumes:
      - iting_kafka_data:/var/lib/kafka/data
    healthcheck:
      test: ["CMD-SHELL", "kafka-topics --bootstrap-server localhost:9092 --list"]
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 768M
        reservations:
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
COMPOSEEOF
```

### 5.3 Start Kafka and Verify

```bash
cd /opt/iting

# Start Zookeeper and Kafka
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d zookeeper kafka

# Wait for services to be healthy
echo "Waiting for Zookeeper and Kafka to start..."
sleep 30

# Verify Zookeeper
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps zookeeper
# Expected: Up (healthy)

# Verify Kafka
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps kafka
# Expected: Up (healthy)

# Test Kafka by listing topics
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 --list
# Expected: empty list or __consumer_offsets

# Create a test topic
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic iting-test --partitions 1 --replication-factor 1

# Verify topic creation
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 --list
# Expected: iting-test

# Produce a test message
docker exec iting-kafka bash -c \
  'echo "Hello ITing" | kafka-console-producer --bootstrap-server localhost:9092 --topic iting-test'

# Consume the test message
docker exec iting-kafka kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic iting-test --from-beginning --max-messages 1
# Expected: Hello ITing

# Clean up test topic
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --delete --topic iting-test
```

### 5.4 Pre-create Application Topics

```bash
# Create topics needed by the ITing application
# These topics are based on the backend's Kafka usage

docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic iting-job-events --partitions 3 --replication-factor 1

docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic iting-chat-events --partitions 3 --replication-factor 1

docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic iting-notification-events --partitions 3 --replication-factor 1

docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic iting-application-events --partitions 3 --replication-factor 1

docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic iting-user-events --partitions 3 --replication-factor 1

# Verify all topics
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Describe a topic to verify configuration
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 \
  --describe --topic iting-job-events
```

### 5.5 Configure Kafka Monitoring (for Prometheus)

```bash
# Add JMX exporter configuration for Kafka metrics
cat > ./deploy/monitoring/kafka-jmx-config.yml << 'EOF'
---
lowercaseOutputName: true
lowercaseOutputLabelNames: true
rules:
  - pattern: "kafka.controller<type=ControllerStats,name=(.*)><>(.+)"
    name: "kafka_controller_$1"
    labels:
      type: "$2"
  - pattern: "kafka.network<type=RequestMetrics,name=(.+)><>Value"
    name: "kafka_network_request_$1"
  - pattern: "kafka.server<type=ReplicaManager,name=(.+),topic=(.+)><>Value"
    name: "kafka_server_replicamanager_$1"
    labels:
      topic: "$2"
  - pattern: "kafka.server<type=(.+),name=(.+)><>Value"
    name: "kafka_server_$1_$2"
  - pattern: "kafka.log<type=Log,name=(.+),topic=(.+)><>Value"
    name: "kafka_log_$1"
    labels:
      topic: "$2"
  - pattern: "kafka.cluster<type=Replica,name=(.+)><>Value"
    name: "kafka_cluster_replica_$1"
EOF
```

## Verification

```bash
# Verify both containers are running
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps zookeeper kafka

# Test connectivity from within the Docker network
docker exec iting-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 | head -5

# Verify topic list
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check Kafka logs for errors
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs kafka --tail=20

# Check Zookeeper logs for errors
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs zookeeper --tail=20

# Verify Kafka is accessible from backend network
docker run --rm --network iting-net confluentinc/cp-kafka:7.4.0 \
  kafka-topics --bootstrap-server kafka:29092 --list
```

## Rollback

```bash
# Stop Kafka and Zookeeper
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down kafka zookeeper

# Remove Kafka data (destructive - loses all messages)
docker volume rm iting_kafka_data iting_zookeeper_data

# Remove Kafka configuration
rm /opt/iting/config/kafka/server.properties
```

## References

- `ITing-backend/docker-compose.yml` - Existing Kafka/Zookeeper configuration for reference
- `ITing-backend/build.gradle` - Spring Kafka dependency
- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Kafka monitoring patterns
