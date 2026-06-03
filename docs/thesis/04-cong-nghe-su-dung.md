# Báo cáo các công nghệ được áp dụng trong hệ thống ITing

*Tài liệu phục vụ đưa vào luận văn tốt nghiệp. Nội dung bám theo mã nguồn trong kho `ITing` tại thời điểm phân tích.*

---

## 1. Giới thiệu chung

Trong quá trình phát triển hệ thống cổng thông tin việc làm ITing, nhóm phát triển đã lựa chọn và tích hợp nhiều công nghệ từ các nhà cung cấp khác nhau nhằm đảm bảo hệ thống đáp ứng được các yêu cầu về hiệu năng, khả năng mở rộng, bảo mật và tính sẵn sàng cho việc vận hành thực tế. Báo cáo này trình bày chi tiết các công nghệ đã được áp dụng, phân tích lý do lựa chọn thay vì các giải pháp thay thế, và đánh giá vai trò của từng công nghệ trong kiến trúc tổng thể của hệ thống.

Cấu trúc mã nguồn backend được tổ chức theo mô hình **module hóa** (modular monolith), trong đó các nghiệp vụ được chia thành các package riêng biệt như `auth` (xác thực), `job` (quản lý việc làm), `application` (quản lý hồ sơ ứng tuyển), `messaging` (nhắn tin thời gian thực), `recommendation` (gợi ý việc làm), và `payment` (thanh toán). Mô hình này cho phép tách biệt các mối quan tâm (separation of concerns) mà vẫn duy trì tính đơn giản trong triển khai và vận hành so với kiến trúc microservice hoàn toàn tách biệt.

---

## 2. Quản lý mã nguồn và Repository

### 2.1. Git và GitHub cho Version Control

**Mô tả:** **Git** là hệ thống quản lý phiên bản phân tán (Distributed Version Control System - DVCS), cho phép theo dõi các thay đổi trong mã nguồn và phối hợp làm việc giữa nhiều thành viên trong nhóm phát triển. **GitHub** là nền tảng hosting Git repository trên cloud, cung cấp các tính năng collaborative như pull requests, code reviews, issue tracking, và GitHub Actions cho CI/CD. Kho `ITing` được lưu trữ trên GitHub tại địa chỉ `github.com/<organization>/ITing`.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Git + GitHub | Git + GitLab | Git + Bitbucket | Mercurial |
|----------|-------------|--------------|-----------------|-----------|
| UI/UX | Tốt, thân thiện | Tốt | Tốt | Hạn chế |
| Private repos | Miễn phí (giới hạn collaborators) | Miễn phí (giới hạn) | Miễn phí (giới hạn) | Miễn phí |
| CI/CD tích hợp | GitHub Actions (mạnh, tích hợp sâu) | GitLab CI (mạnh) | Pipelines (yếu hơn) | Không tích hợp |
| Marketplace | Rất phong phú | Phong phú | Hạn chế | Không |
| Enterprise features | Có (GitHub Enterprise) | Có (GitLab Ultimate) | Có (Atlassian) | Không |

**Lý do lựa chọn:** GitHub được chọn vì GitHub Actions — hệ thống CI/CD tích hợp sâu cho phép xây dựng các pipeline automation mà không cần sử dụng dịch vụ bên thứ ba như Jenkins hoặc CircleCI. Marketplace phong phú với các Actions do cộng đồng phát triển giúp đội phát triển nhanh chóng tích hợp các công cụ như Trivy (security scanning), Docker build/push, SSH deployment, và Discord webhook notifications. Ngoài ra, GitHub Actions có free tier hào phóng với 2.000 phút runner time mỗi tháng cho public repositories.

**Phạm vi sử dụng trong dự án:** Quản lý mã nguồn cho cả backend và frontend, version control cho các commit và branches, pull request workflow cho code review, và CI/CD automation qua hai workflow files: `ci.yml` (build, test, scan) và `deploy.yml` (deployment to EC2).

### 2.2. Cấu trúc Repository và Branching Strategy

**Mô tả:** Kho `ITing` được tổ chức theo cấu trúc multi-component repository với hai thành phần chính nằm trong cùng một monorepo nhưng quản lý độc lập:

```
ITing/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI pipeline
│       └── deploy.yml      # CD pipeline
├── ITing-backend/          # Java Spring Boot backend
├── ITing-frontend/         # Next.js React frontend
├── deploy/                 # Docker Compose & scripts
└── docs/                  # Tài liệu
```

**Branching strategy:** Dự án áp dụng GitHub Flow đơn giản hóa:
- `main`: branch chính chứa code đã qua review và ready deploy
- `develop`: branch tích hợp cho các feature đang phát triển
- Feature branches: `feature/<ten-feature>` cho từng tính năng
- Hotfix branches: `hotfix/<ten-hotfix>` cho các sửa lỗi khẩn cấp

**Lý do lựa chọn:** Cấu trúc monorepo với multi-component giúp đơn giản hóa việc quản lý dependency giữa frontend và backend (ví dụ: frontend có thể reference backend API specs), đồng thời cho phép CI/CD pipeline xử lý cả hai thành phần trong cùng một workflow. GitHub Flow được chọn thay vì GitFlow phức tạp hơn vì quy mô đồ án không đòi hỏi các quy trình release phức tạp.

---

## 3. Nền tảng lập trình và framework chính

### 3.1. Java 17 và Spring Boot 3.2.1

**Mô tả:** Hệ thống ITing được xây dựng trên nền tảng **Java 17** với framework **Spring Boot 3.2.1**. Java 17 là phiên bản Long-Term Support (LTS) được Oracle hỗ trợ dài hạn, mang lại sự ổn định cao cho các dự án doanh nghiệp. Spring Boot là framework mã nguồn mở giúp đơn giản hóa quá trình khởi tạo và cấu hình ứng dụng Spring, đồng thời cung cấp sẵn các module con cho Web, Data, Security, Cache, và nhiều chức năng khác.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Spring Boot | Node.js/Express | Django/Python |
|----------|-------------|-----------------|---------------|
| Hiệu năng xử lý | Cao (bytecode native, JIT compiler) | Trung bình | Trung bình |
| Hệ sinh thái enterprise | Rất phong phú (Spring Cloud, Spring Data) | Hạn chế | Trung bình |
| Quản lý giao dịch phức tạp | Hỗ trợ ACID tự nhiên qua Spring Transaction | Cần thư viện bổ sung | Qua ORM |
| Đường cong học tập | Cao (nhiều khái niệm) | Thấp | Thấp |
| Bảo mật tích hợp | Spring Security mạnh mẽ | passport.js (phân mảnh) | Django Auth (cơ bản) |

**Lý do lựa chọn:** Spring Boot được chọn vì hệ sinh thái phong phú hỗ trợ đầy đủ các yêu cầu nghiệp vụ phức tạp của một cổng việc làm — từ xác thực JWT, quản lý phiên, đến tích hợp cơ sở dữ liệu và message broker. Ngoài ra, Java 17 với virtual threads (Preview trong 17, GA trong 21) cho phép xử lý đồng thời lượng lớn kết nối mà không cần quản lý thread theo cách truyền thống.

**Phạm vi sử dụng trong dự án:** Toàn bộ ứng dụng backend được xây dựng trên Spring Boot, bao gồm tất cả các API REST, WebSocket endpoints, Kafka consumers/producers, và các scheduled tasks.

### 3.2. Spring Data JPA và Hibernate

**Mô tả:** **Spring Data JPA** là một phần của hệ sinh thái Spring, cung cấp lớp trừu tượng trên **Java Persistence API (JPA)** — chuẩn ORM của Java Enterprise. Triển khai mặc định là **Hibernate**, một trong những ORM framework phổ biến và mạnh mẽ nhất trong hệ sinh thái Java. Spring Data JPA giảm đáng kể lượng code boilerplate cần viết khi thao tác với cơ sở dữ liệu thông qua Repository pattern.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Spring Data JPA / Hibernate | MyBatis | jOOQ | JDBC thuần |
|----------|------------------------------|---------|------|------------|
| Năng suất lập trình | Rất cao ( declarative query) | Trung bình (SQL map XML/注解) | Trung bình (type-safe SQL) | Thấp |
| Hiệu năng | Tốt (caching, lazy loading) | Rất tốt (SQL kiểm soát hoàn toàn) | Tốt | Tối ưu nhất |
| Hỗ trợ quan hệ phức tạp | Mạnh (Entity associations) | Yếu (manual mapping) | Yếu | Không |
| Database portability | Cao (abstract DB) | SQL thủ công | Cao | Không |

**Lý do lựa chọn:** Hệ thống ITing có mô hình dữ liệu phức tạp với nhiều quan hệ (users ↔ companies ↔ jobs ↔ applications ↔ reviews ↔ notifications). Hibernate với Spring Data JPA giúp quản lý các quan hệ này một cách trực quan thông qua Entity mapping, đồng thời tận dụng các tính năng như lazy loading để tối ưu bộ nhớ, và first-level cache để giảm số lượng truy vấn CSDL.

---

## 4. Hệ quản trị cơ sở dữ liệu

### 4.1. PostgreSQL 16+

**Mô tả:** **PostgreSQL** là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở được biết đến với khả năng mở rộng và tuân thủ chuẩn SQL. Phiên bản 16+ được sử dụng trong hệ thống ITing với sự hỗ trợ của **Amazon RDS** (Relational Database Service) — dịch vụ cơ sở dữ liệu quan hệ được quản lý hoàn toàn trên AWS. Dịch vụ RDS giúp giảm gánh nặng vận hành bao gồm sao lưu tự động, cập nhật phiên bản, và giám sát hiệu năng thông qua Amazon CloudWatch.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | PostgreSQL | MySQL | MongoDB | Microsoft SQL Server |
|----------|------------|-------|---------|----------------------|
| Mô hình dữ liệu | Quan hệ + JSON (jsonb) | Quan hệ | Document | Quan hệ |
| Hỗ trợ ACID | Đầy đủ (full ACID) | Đầy đủ với InnoDB | Đầy đủ (document) | Đầy đủ |
| Chi phí vận hành | Mã nguồn mở, tự quản lý hoặc RDS | Mã nguồn mở, tự quản lý hoặc RDS | Mã nguồn mở, tự quản lý hoặc Atlas | Bản quyền đắt đỏ |
| Tính năng nâng cao | Full-text search, Window functions, GIS | Replication, sharding | Flexible schema, aggregation | T-SQL stored procedure |
| Json bất kỳ truy vấn | Mạnh (jsonb indexing) | Yếu (MySQL 8+) | Tích hợp sẵn | Hạn chế |

**Lý do lựa chọn:** PostgreSQL được chọn vì khả năng lưu trữ và truy vấn JSON hiệu quả thông qua kiểu dữ liệu `jsonb` cùng với chỉ mục GIN — cho phép hệ thống lưu trữ các dữ liệu semi-structured như CV parsing results, embedding vectors, và metadata linh hoạt. Đồng thời, PostgreSQL hỗ trợ full-text search tích hợp, giúp triển khai tính năng tìm kiếm việc làm mà không cần thêm Elasticsearch. Ngoài ra, Amazon RDS for PostgreSQL cung cấp khả năng mở rộng throughput I/O với Provisioned IOPS và hỗ trợ Multi-AZ deployments cho tính sẵn sàng cao.

**Phạm vi sử dụng trong dự án:** Toàn bộ dữ liệu nghiệp vụ chính bao gồm thông tin người dùng, công ty, việc làm, hồ sơ ứng tuyển, đánh giá, thông báo, blog, và thanh toán được lưu trữ trên PostgreSQL.

### 4.2. Flyway cho quản lý migration

**Mô tả:** **Flyway** là công cụ quản lý phiên bản cơ sở dữ liệu (database migration tool), cho phép đội phát triển theo dõi các thay đổi schema thông qua các file SQL có version. Mỗi migration được đánh số version và thực thi theo thứ tự, đảm bảo schema CSDL luôn nhất quán giữa các môi trường.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Flyway | Liquibase | Prisma Migrate | Manual SQL scripts |
|----------|--------|-----------|----------------|-------------------|
| Định dạng | SQL thuần hoặc Java | XML/YAML/JSON/SQL | DSL (Prisma Schema) | SQL thủ công |
| Rollback | Hạn chế (paid version) | Có (changeset) | Có | Không tự động |
| CI/CD integration | Tốt | Tốt | Tốt | Khó tích hợp |
| Hỗ trợ nhiều DB | Nhiều | Nhiều | PostgreSQL, MySQL, SQLite | Phụ thuộc SQL |

**Lý do lựa chọn:** Flyway được tích hợp sẵn trong Spring Boot starter, hoạt động với SQL thuần — giúp đội phát triển dễ dàng đọc, kiểm tra, và debug các migration mà không cần học cú pháp XML/YAML của Liquibase hay DSL của Prisma. Số lượng 86 file migration trong kho `db/migration` phản ánh quy mô và độ phức tạp của schema, đồng thời chứng minh tính cần thiết của một công cụ migration tự động.

---

## 5. Caching và tối ưu hiệu năng

### 5.1. Redis làm Cache phân tán (Lớp L2)

**Mô tả:** **Redis** (Remote Dictionary Server) là hệ thống lưu trữ dữ liệu in-memory với kiểu dữ liệu phong phú bao gồm strings, lists, sets, sorted sets, hashes, và streams. Trong kiến trúc ITing, Redis đóng vai trò là lớp cache phân tán (Lớp 2 sau Caffeine local cache), đồng thời phục vụ các chức năng pub/sub cho messaging thời gian thực và rate limiting.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Redis | Memcached | Ehcache (JVM-local) | Hazelcast |
|----------|-------|-----------|---------------------|-----------|
| Persistence | Optional (RDB/AOF) | Không | Không (persistent cache) | Optional |
| Kiểu dữ liệu | Phong phú (5+ kiểu) | Chỉ string | Hash, collection | Phong phú |
| Clustering | Hỗ trợ chính thức (Redis Cluster) | Không | Không | Hỗ trợ mạnh |
| Cache-aside pattern | Cần tự implement | Cần tự implement | Spring Cache tích hợp | Spring Cache tích hợp |
| Rate limiting tích hợp | Qua Bucket4j | Không | Không | Không |

**Lý do lựa chọn:** Redis được chọn vì tích hợp tốt với Spring Boot thông qua Spring Data Redis, đồng thời **Bucket4j** — thư viện rate limiting — hỗ trợ Redis làm storage backend cho distributed rate limiting. Ngoài ra, Redis pub/sub hỗ trợ kiến trúc messaging thời gian thực qua WebSocket mà không cần thêm message broker riêng biệt cho use case đơn giản. Redis Cluster và Sentinel cung cấp các tùy chọn high availability linh hoạt.

**Phạm vi sử dụng trong dự án:** Cache kết quả tìm kiếm việc làm (TTL 120 giây), cache danh sách gợi ý việc làm (TTL 180 giây), cache embedding vectors (TTL 24 giờ), session management với refresh tokens, rate limiting theo IP và user ID, và pub/sub cho các kênh thông báo.

### 5.2. Caffeine làm Local Cache (Lớp L1)

**Mô tả:** **Caffeine** là thư viện caching high-performance cho Java, được thiết kế thay thế cho ConcurrentHashMap-based cache hoặc Guava Cache. Caffeine tích hợp sẵn với Spring Boot thông qua Spring Cache abstraction, hoạt động như L1 cache — cache in-process nằm trong JVM của ứng dụng.

**Lý do lựa chọn:** Caffeine được chọn vì hiệu năng vượt trội so với Ehcache hoặc Guava Cache trong hầu hết các benchmark, đặc biệt với các workload có high hit rate. Việc kết hợp Caffeine (L1) + Redis (L2) tạo ra kiến trúc multi-level caching tối ưu: L1 xử lý các request có cache hit nhanh nhất có thể (truy cập in-memory), L2 phục vụ các cache miss hoặc khi cần shared cache giữa nhiều instance. Cấu hình max-size 10.000 entries đủ lớn cho most frequently accessed data mà không gây memory pressure.

### 5.3. Redisson cho Distributed Locking

**Mô tả:** **Redisson** là Redis client cho Java, cung cấp các đối tượng phân tán (distributed objects) như `RLock`, `RMap`, `RSemaphore` hoạt động tương tự các đối tượng Java tiêu chuẩn nhưng được đồng bộ hóa qua Redis. Trong ITing, Redisson được sử dụng để triển khai distributed locking ngăn chặn race conditions khi nhiều instance của ứng dụng cùng truy cập tài nguyên.

**Lý do lựa chọn:** Các giải pháp thay thế như ShardedJedis hoặc Jedis thuần yêu cầu tự implement logic locking phức tạp. Redisson cung cấp Lock interface tương tự `java.util.concurrent.locks.Lock` nhưng hoạt động phân tán, giảm code phức tạp và giảm rủi ro deadlock nhờ automatic lock renewal.

---

## 6. Message Broker và xử lý sự kiện

### 6.1. Apache Kafka cho Event Streaming

**Mô tả:** **Apache Kafka** là nền tảng event streaming phân tán, cho phép xây dựng các pipeline dữ liệu real-time và các ứng dụng event-driven. Kafka sử dụng mô hình pub/sub với consumer groups, cho phép nhiều consumers xử lý cùng một topic song song. Phiên bản **Confluent Kafka 7.4.0** được sử dụng trong ITing, tích hợp qua Spring Kafka.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Apache Kafka | RabbitMQ | Amazon SQS | Redis Pub/Sub |
|----------|--------------|----------|------------|---------------|
| Mô hình | Event streaming (log-based) | Message queue (AMQP) | Message queue (FIFO/Standard) | Pub/Sub đơn giản |
| Message retention | Có (configurable, có thể replay) | Có (persistent messages) | Có (1-14 ngày) | Không (fire-and-forget) |
| Throughput | Rất cao (hàng triệu msg/s) | Cao (hàng chục ngàn msg/s) | Cao (hàng chục ngàn msg/s) | Cao nhưng đơn giản |
| Ordering | Per partition | Per channel/queue | Per queue (FIFO) | Không guaranteed |
| Routing flexibility | Phân vùng theo key | Exchange routing phức tạp | Không | Không |

**Lý do lựa chọn:** Kafka được chọn vì khả năng xử lý throughput cao cần thiết cho các tác vụ như embedding generation (khi CV mới được upload, cần tạo embedding vector không blocking API response), và khả năng replay messages hỗ trợ debug và xử lý lỗi. Event sourcing pattern với Kafka cho phép hệ thống tái construct trạng thái tại bất kỳ thời điểm nào. Ngoài ra, Confluent platform cung cấp Schema Registry — đảm bảo contract giữa producers và consumers không bị phá vỡ khi schema thay đổi.

**Phạm vi sử dụng trong dự án:** `job.embedding.requested.v1` cho yêu cầu tạo embedding việc làm, `application.created.v1` cho sự kiện hồ sơ ứng tuyển mới, `kyb.review.completed.v1` cho sự kiện hoàn thành KYB (Know Your Business). Mỗi topic có Dead Letter Topic (DLT) để xử lý các message thất bại.

### 6.2. Transactional Outbox Pattern

**Mô tả:** Thay vì gửi message trực tiếp tới Kafka trong business logic (có thể fail sau khi transaction đã commit), hệ thống ITing triển khai **Outbox Pattern**: mỗi sự kiện được ghi vào bảng `OutboxEvent` cùng trong transaction với business data, sau đó `OutboxDispatcher` đọc các sự kiện chưa được gửi và publish lên Kafka.

**Lý do lựa chọn:** Pattern này đảm bảo tính atomic giữa business operation và event emission — nếu business transaction fail, event cũng không được gửi. Đây là common pattern trong microservice architecture để tránh inconsistent state khi distributed transactions không available.

---

## 7. Trí tuệ nhân tạo và Machine Learning

### 7.1. Hugging Face cho Semantic Embedding

**Mô tả:** **Hugging Face** là nền tảng mã nguồn mở cung cấp các pre-trained transformer models và công cụ phát triển AI. Trong ITing, Hugging Face được sử dụng để tạo **semantic embeddings** — vector biểu diễn ngữ nghĩa của CV và việc làm — phục vụ cho việc matching ứng viên-việc làm.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Hugging Face Embedding | OpenAI Embedding | Self-hosted Transformer |
|----------|----------------------|------------------|------------------------|
| Chi phí | Miễn phí (self-hosted) / Trả phí (Inference API) | Chi phí theo token | Chi phí GPU server |
| Chất lượng | Tốt (768d gemma, 384d minilm) | Rất tốt (text-embedding-3-small) | Phụ thuộc model |
| Deployment flexibility | Cao (local部署 hoặc cloud) | Chỉ cloud | Cao nhưng cần GPU |
| Latency | Thấp (local inference) | Trung bình (API call) | Thấp (local) |

**Lý do lựa chọn:** Hugging Face được chọn làm embedding provider mặc định vì cho phép self-hosted inference — giảm chi phí vận hành đáng kể khi volume embedding generation cao (mỗi CV mới tạo vector 768 chiều). Model `gemma` cho job embedding và `minilm` cho CV embedding được fine-tuned cho Vietnamese text. Việc support fallback sang OpenAI qua `EMBEDDING_PROVIDER` env var đảm bảo tính linh hoạt.

**Phạm vi sử dụng trong dự án:** Tạo embedding vector cho việc làm (768 chiều), embedding vector cho CV ứng viên (384 chiều), similarity search giữa CV và danh sách việc làm phù hợp.

### 7.2. Google Gemini cho AI Content Generation

**Mô tả:** **Google Gemini** (trước đây là PaLM) là large language model (LLM) của Google, cung cấp API cho text generation, conversation, và multimodal tasks. Trong ITing, Gemini được sử dụng qua **Spring AI** — framework abstraction cho các AI providers.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Google Gemini | OpenAI GPT-4 | Anthropic Claude | Azure OpenAI |
|----------|--------------|--------------|------------------|--------------|
| Pricing | Cạnh tranh | Cao | Cạnh tranh | Tương đương OpenAI |
| Vietnamese support | Tốt | Tốt | Tốt | Tốt |
| API stability | Đang phát triển | Ổn định | Ổn định | Ổn định |
| Context window | Lớn (1M tokens) | 128K tokens | 200K tokens | 128K tokens |
| Function calling | Có | Có | Có | Có |

**Lý do lựa chọn:** Gemini được chọn vì chi phí per token cạnh tranh hơn GPT-4, đồng thời hỗ trợ context window rất lớn (lên đến 1M tokens trong Gemini 1.5) — phù hợp cho use case phân tích CV dài. Ngoài ra, Spring AI cung cấp abstraction layer cho phép switch giữa các providers mà không cần thay đổi code nghiệp vụ.

**Phạm vi sử dụng trong dự án:** AI cover letter generation (tạo thư giới thiệu tự động dựa trên CV và mô tả công việc), CV parsing và information extraction.

---

## 8. Bảo mật và xác thực

### 8.1. Spring Security với JWT

**Mô tả:** **Spring Security** là framework bảo mật toàn diện cho các ứng dụng Spring. Trong ITing, Spring Security được cấu hình với **JWT (JSON Web Token)** làm cơ chế xác thực stateless. Mỗi khi người dùng đăng nhập, hệ thống tạo ra access token (hết hạn sau 24 giờ) và refresh token (hết hạn sau 7 ngày). Access token được gửi kèm mỗi request qua header `Authorization: Bearer <token>`.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | JWT Stateless | Session + Redis | OAuth2 (Authorization Server) | SAML |
|----------|---------------|-----------------|--------------------------------|------|
| Scalability | Cao (không share state) | Trung bình (Redis bottleneck potential) | Cao | Trung bình |
| CSRF protection | Không cần (token in header) | Cần (cookie-based) | Cần | Không (SAML assertion) |
| Logout mechanism | Token blacklist hoặc short expiry | Session invalidate | Token revoke | Session invalidate |
| Complexity | Thấp | Trung bình | Cao | Rất cao |
| Mobile/native support | Tốt (API-friendly) | Khó (cookie khó handle) | Tốt | Khó |

**Lý do lựa chọn:** JWT được chọn vì phù hợp với mô hình SPA (Single Page Application) và mobile apps — không cần duy trì server-side session state, giúp horizontal scaling dễ dàng. Mỗi instance có thể xác thực token mà không cần truy vấn Redis/database (token có chứa claims và signature). Refresh token mechanism với max 5 tokens per user giới hạn thiệt hại nếu refresh token bị leak.

### 8.2. OAuth2 với Google Sign-In

**Mô tả:** Ngoài xác thực username/password, ITing tích hợp **Google OAuth2** cho phép đăng nhập bằng tài khoản Google — giảm barrier đăng ký và tăng trải nghiệm người dùng.

**Lý do lựa chọn:** OAuth2 là industry standard cho social login, được hỗ trợ bởi hầu hết các nhà cung cấp identity (Google, Facebook, GitHub). Việc tích hợp qua Spring Security OAuth2 Client đơn giản và an toàn — ứng dụng chỉ nhận được user info từ Google, không bao giờ nhận credentials.

---

## 9. Lưu trữ đối tượng và file

### 9.1. Amazon S3

**Mô tả:** **Amazon S3** (Simple Storage Service) là dịch vụ lưu trữ đối tượng (object storage) của AWS, cung cấp khả năng lưu trữ và truy xuất dữ liệu với độ bền 99.999999999% (11 9's). Trong ITing, S3 được sử dụng qua **AWS SDK v2** để lưu trữ các file như CV/resume (PDF, DOCX), avatar người dùng, và các tài liệu công ty.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Amazon S3 | Google Cloud Storage | Azure Blob Storage | Self-hosted (MinIO) |
|----------|-----------|----------------------|--------------------|--------------------|
| Chi phí | Tiered storage classes | Tương tự S3 | Tương tự S3 | Chi phí server +运维 |
| SDK integration | AWS SDK v2 (tốt) | GCS client (tốt) | Azure SDK (tốt) | S3-compatible (MinIO) |
| Integrations | Rất nhiều (CloudFront, Lambda, ...) | Nhiều | Nhiều | Ít hơn |
| durability | 11 9's | 11 9's | 11 9's | Phụ thuộc setup |

**Lý do lựa chọn:** S3 được chọn vì tích hợp chặt chẽ với hệ sinh thái AWS (RDS, EC2 đang sử dụng), chi phí tiered storage (S3 Standard, S3 Infrequent Access, S3 Glacier) cho phép tối ưu chi phí lưu trữ theo tần suất truy cập. Lifecycle policies tự động di chuyển dữ liệu sang tier rẻ hơn sau khi hết hạn.

**Phạm vi sử dụng trong dự án:** Lưu trữ CV ứng viên (với presigned URL để tải về bảo mật), avatar người dùng và công ty, và các tài liệu đính kèm trong job postings.

---

## 10. Xử lý tài liệu

### 10.1. Apache PDFBox và Apache POI

**Mô tả:** Hệ thống ITing hỗ trợ import CV từ nhiều định dạng file khác nhau. **Apache PDFBox** (phiên bản 2.0.30) được sử dụng để trích xuất text từ file PDF, trong khi **Apache POI** (phiên bản 5.2.3) xử lý các file Microsoft Word (DOC/DOCX) và Excel (XLS/XLSX).

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Apache PDFBox | iText | PDF.js (browser-based) | Tika |
|----------|---------------|-------|------------------------|------|
| License | Apache 2.0 (miễn phí) | AGPL (thương mại) | MPL (miễn phí) | Apache 2.0 |
| PDF extraction | Tốt | Rất tốt | Không (browser) | Tốt |
| Word/DOCX support | Không | Có (Apache POI) | Không | Có |
| Size/weight | Nhẹ | Nặng (nhiều tính năng) | Nặng | Nặng |

**Lý do lựa chọn:** PDFBox và POI là hai thư viện mã nguồn mở, nhẹ, và hoạt động tốt trong môi trường Java backend. iText yêu cầu license thương mại cho use case commercial. Việc tách riêng hai thư viện cho PDF và Word/Excel giúp đơn giản hóa dependencies và tránh oversized library.

**Phạm vi sử dụng trong dự án:** Trích xuất nội dung CV từ PDF để phân tích bằng AI, export báo cáo lương và hóa đơn ra định dạng PDF.

---

## 11. Container hóa và triển khai

### 11.1. Docker và Docker Compose

**Mô tả:** **Docker** là nền tảng container hóa cho phép đóng gói ứng dụng và tất cả dependencies vào một container image có thể chạy trên bất kỳ máy nào có Docker Engine. **Dockerfile** của ITing backend sử dụng multi-stage build: build stage dùng Gradle image để compile, runtime stage chỉ chứa JRE (không có compiler) để giảm kích thước image. **Docker Compose** điều phối đa container trên cùng một host trong môi trường development.

**Các giải pháp thay thế được xem xét:**

| Tiêu chí | Docker Compose | Kubernetes | AWS ECS | Heroku (PaaS) |
|----------|----------------|------------|---------|----------------|
| Complexity | Thấp | Rất cao | Trung bình | Thấp |
| Scalability | Manual scaling | Auto-scaling, self-healing | Auto-scaling | Tự động (nhưng limited) |
| Multi-host networking | Không (single host) | Có (CNI) | Có | Không |
| Learning curve | Thấp | Cao | Trung bình | Thấp |
| Cost | Server cost only | Server + management | Server + management | Subscription-based |

**Lý do lựa chọn:** Docker Compose được chọn cho môi trường development và production (trên EC2) vì đơn giản, dễ hiểu, và đủ cho quy mô đồ án/mục đích học tập. Kubernetes mang lại nhiều tính năng enterprise nhưng yêu cầu cluster management và chi phí cao hơn — không cần thiết cho hệ thống đơn lẻ. Docker Compose file cũng dễ dàng chuyển đổi sang Kubernetes manifests khi hệ thống cần mở rộng.

### 11.2. Nginx làm Reverse Proxy

**Mô tả:** **Nginx** được sử dụng như reverse proxy và TLS termination trong kiến trúc ITing. Nginx tiếp nhận HTTPS requests từ người dùng, chuyển tiếp HTTP requests tới các backend services (backend Spring Boot và frontend Next.js), và quản lý SSL/TLS certificates với **Certbot** (Let’s Encrypt) để tự động gia hạn chứng chỉ.

**Lý do lựa chọn:** Nginx được chọn vì hiệu năng cao (event-driven, non-blocking), footprint thấp, và ecosystem phong phú. Là reverse proxy, Nginx cho phép chạy nhiều services trên cùng một server với các cổng khác nhau mà người dùng chỉ cần truy cập qua một URL duy nhất. Tích hợp Let’s Encrypt miễn phí qua Certbot giảm chi phí vận hành.

---

## 12. Quan sát và giám sát hệ thống

### 12.1. Spring Actuator

**Mô tả:** **Spring Actuator** là module của Spring Boot cung cấp các production-ready endpoints cho giám sát và quản lý ứng dụng. Actuator endpoints bao gồm `/actuator/health` cho health checks, `/actuator/metrics` cho application metrics (theo Micrometer format), và `/actuator/env` cho configuration inspection.

**Lý do lựa chọn:** Actuator được tích hợp sẵn trong Spring Boot Starter, không yêu cầu cấu hình phức tạp. Health endpoint `/actuator/health` được sử dụng bởi Docker healthcheck và CI/CD pipeline để xác nhận ứng dụng đã sẵn sàng sau khi deploy. Metrics endpoint hỗ trợ tích hợp với các công cụ giám sát như Datadog, Prometheus, hoặc CloudWatch.

### 12.2. OpenTelemetry cho Distributed Tracing

**Mô tả:** **OpenTelemetry** (OTel) là standard framework cho observability (logging, metrics, tracing) được Cloud Native Computing Foundation (CNCF) back. Docker Compose production sử dụng OpenTelemetry Java agent để tự động instrumentation cho Spring MVC, JDBC, Redis, và Kafka — tạo traces có thể visualize trong các công cụ như Jaeger hoặc AWS X-Ray.

**Lý do lựa chọn:** OpenTelemetry được chọn vì vendor-agnostic: traces có thể exported tới nhiều backends (Jaeger, Zipkin, AWS X-Ray, Datadog) mà không cần thay đổi code. Auto-instrumentation agent không yêu cầu thay đổi source code, giảm effort triển khai tracing vào hệ thống existing.

---

## 13. Các công nghệ hỗ trợ khác

### 13.1. Lombok

**Mô tả:** **Lombok** là annotation processor cho Java, tự động generate getters, setters, constructors, `toString()`, `equals()`, và `hashCode()` tại compile time. Lombok giảm đáng kể boilerplate code, giúp các Entity và DTO classes gọn gàng hơn.

### 13.2. MapStruct

**Mô tả:** **MapStruct** là annotation-based code generator cho việc mapping giữa các Java beans (ví dụ: DTO ↔ Entity ↔ Response). Khác với reflection-based mappers như ModelMapper hay BeanUtils, MapStruct generate code mapping tại compile time — đảm bảo type safety và hiệu năng tương đương với code thủ công.

### 13.3. Cloudinary

**Mô tả:** **Cloudinary** là cloud-based image management service cung cấp upload, storage, transformation (resize, crop, format conversion), và CDN delivery. Trong ITing, Cloudinary được sử dụng để quản lý avatar và images với automatic optimization và caching.

**Lý do lựa chọn:** Cloudinary cung cấp URL-based transformations — không cần backend process image, chỉ cần generate transformation URL và Cloudinary sẽ xử lý on-the-fly. Điều này giảm tải cho backend và đảm bảo images được optimized cho từng client (mobile vs desktop).

---

## 13. Tổng kết

Bảng dưới đây tổng hợp toàn bộ các công nghệ đã được áp dụng trong hệ thống ITing theo từng nhóm chức năng:

| Nhóm | Công nghệ | Vai trò |
|------|-----------|---------|
| **Quản lý mã nguồn** | Git, GitHub, GitHub Actions | Version control và CI/CD |
| **Nền tảng** | Java 17, Spring Boot 3.2.1 | Application framework |
| **Cơ sở dữ liệu** | PostgreSQL 16+, Flyway | RDBMS + Schema migration |
| **Caching** | Caffeine (L1), Redis (L2) | Multi-level cache |
| **Message Broker** | Apache Kafka 7.4 | Async event processing |
| **AI/ML** | Hugging Face, Google Gemini | Embedding + Content generation |
| **Bảo mật** | Spring Security, JWT, OAuth2 | Authentication & Authorization |
| **Lưu trữ** | Amazon S3 | Object storage |
| **Xử lý tài liệu** | Apache PDFBox, Apache POI | Document parsing |
| **Container** | Docker, Docker Compose, Nginx | Containerization & Proxy |
| **Quan sát** | Spring Actuator, OpenTelemetry | Monitoring & Tracing |
| **Hỗ trợ** | Lombok, MapStruct, Cloudinary | Productivity & Image CDN |

Sự kết hợp các công nghệ trên tạo nên một hệ thống backend hiện đại, có khả năng mở rộng, và sẵn sàng cho việc triển khai production. Mỗi công nghệ được lựa chọn dựa trên nguyên tắc cân bằng giữa hiệu năng, chi phí vận hành, độ phức tạp, và tính phù hợp với quy mô dự án. Các giải pháp thay thế đã được xem xét kỹ lưỡng, và danh sách lựa chọn cuối cùng phản ánh sự phù hợp tối ưu cho bối cảnh đồ án học tập và nghiên cứu.

---

*Tài liệu tham khảo trong kho mã nguồn:* `ITing-backend/pom.xml`, `ITing-backend/build.gradle`, `ITing-backend/src/main/resources/application.properties`, `deploy/docker-compose.yml`.