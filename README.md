# ITing Job Portal

A modern, scalable job portal platform built with microservices architecture, featuring AI-powered capabilities for job matching and candidate screening. ITing connects job seekers with employers through an intelligent, user-friendly platform.

**Status**: Production-Ready | **License**: ISC | **Version**: 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Monitoring & Logging](#monitoring--logging)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## 🎯 Overview

ITing is a comprehensive job portal platform designed for both job seekers and employers. The platform leverages modern technologies including Spring Boot backend, React frontend, and AI-powered NLP features to provide an intelligent job matching experience.

### Key Highlights
- **Full-Stack Architecture**: Modular Spring Boot backend, responsive React frontend
- **AI/ML Integration**: Semantic search, skills extraction, and intelligent job reranking
- **Enterprise-Grade Deployment**: Docker containerization, Kubernetes-ready, AWS integration
- **Comprehensive Monitoring**: Prometheus metrics, Grafana dashboards, distributed tracing with Tempo
- **Security First**: JWT authentication, RBAC-based authorization, OAuth 2.0 support
- **High Availability**: Redis caching, Kafka event streaming, load balancing with Nginx

---

## ✨ Features

### For Job Seekers
- Browse and search job listings with AI-powered semantic search
- Build and manage professional profiles
- Apply to jobs with one-click submission
- Receive personalized job recommendations
- Track application status in real-time
- Messaging with recruiters

### For Employers
- Post and manage job listings
- Search candidate profiles using semantic search
- Review applications and candidate matches
- AI-powered candidate screening with skills extraction
- Bulk operations and batch processing
- Analytics and recruitment insights

### Technical Features
- **Authentication**: JWT + Refresh Token with token rotation
- **Authorization**: RBAC with fine-grained permission control
- **Search**: Elasticsearch-compatible semantic search with AI reranking
- **Notifications**: Real-time updates via WebSocket (STOMP)
- **File Management**: S3 integration for resume/document storage
- **Caching**: Redis for performance optimization and rate limiting
- **Event Streaming**: Kafka for asynchronous job processing
- **Monitoring**: Complete observability stack (Prometheus, Grafana, Loki, Tempo)

---

## 🏗️ Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Java | 17+ |
| Framework | Spring Boot | 3.2.1+ |
| ORM | Spring Data JPA / Hibernate | Latest |
| Security | Spring Security + JWT | Latest |
| API Documentation | Springdoc OpenAPI (Swagger) | Latest |
| Database | PostgreSQL | 13+ |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | Latest |
| Bundler | Webpack | 5+ |
| Styling | Tailwind CSS | 3+ |
| State Management | Redux Toolkit | Latest |
| HTTP Client | Axios | Latest |
| Charts | Chart.js | 4+ |
| Testing | Playwright | Latest |

### Machine Learning
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI | Python microservice |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) | Text embedding |
| Reranking | Cross-Encoder (ms-marco-MiniLM-L-6-v2) | Result reranking |
| NLP | Spacy / NLTK | Skill extraction |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker | Application deployment |
| Orchestration | Docker Compose / Kubernetes | Container management |
| Cloud | AWS (EC2, RDS, S3, ECR) | Cloud infrastructure |
| Reverse Proxy | Nginx | Load balancing & SSL/TLS |
| Cache | Redis | In-memory caching, sessions |
| Message Broker | Kafka | Event streaming |
| SSL/TLS | Certbot / Let's Encrypt | Certificate management |

### Monitoring & Logging
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Metrics | Prometheus | Metrics collection |
| Visualization | Grafana | Metrics dashboard |
| Logs | Loki | Log aggregation |
| Log Shipper | Promtail | Log forwarding |
| Tracing | Tempo | Distributed tracing |
| Alerting | Alertmanager | Alert routing & management |

---

## 📁 Project Structure

```
iting/
├── ITing-backend/                 # Spring Boot backend service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/iting/   # Java source code (domain-based modules)
│   │   │   └── resources/        # Configuration, SQL scripts
│   │   └── test/                 # Unit and integration tests
│   ├── build.gradle              # Gradle build configuration
│   ├── Dockerfile                # Development Docker image
│   ├── Dockerfile.prod           # Production Docker image
│   └── instructions/             # Comprehensive documentation
│
├── ITing-frontend/                # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── redux/                # Redux store, slices
│   │   ├── api/                  # API client
│   │   └── styles/               # CSS/Tailwind styles
│   ├── e2e/                      # End-to-end tests (Playwright)
│   ├── public/                   # Static assets
│   ├── webpack.config.js         # Webpack configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── Dockerfile                # Frontend Docker image
│   └── playwright.config.js      # Playwright test configuration
│
├── ITing-ml/                      # AI/ML microservice
│   ├── app/
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── models.py             # ML model definitions
│   │   └── services/             # ML service implementations
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # ML service Docker image
│   └── README.md                 # ML service documentation
│
├── deploy/                        # Deployment configuration
│   ├── docker-compose.yml        # Production composition
│   ├── docker-compose.local.yml  # Local development composition
│   ├── config/                   # Service configurations
│   │   ├── kafka/                # Kafka settings
│   │   ├── nginx/                # Nginx configuration
│   │   ├── redis/                # Redis settings
│   │   └── otel/                 # OpenTelemetry config
│   ├── monitoring/               # Monitoring stack
│   │   ├── prometheus/           # Prometheus configuration
│   │   ├── grafana/              # Grafana dashboards
│   │   ├── loki/                 # Log aggregation
│   │   ├── tempo/                # Distributed tracing
│   │   └── alertmanager/         # Alert management
│   └── scripts/                  # Deployment scripts
│
├── deploy_plan/                   # Deployment documentation
│   ├── 00_OVERVIEW.md
│   ├── 01_aws_infrastructure.md
│   ├── 02_docker_foundation.md
│   └── ...                       # Complete deployment guide
│
├── docs/                          # Project documentation
│   ├── thesis/                   # Thesis/academic documentation
│   └── lighthouse-strategy.md    # Performance optimization guide
│
├── TEST_PLAN/                     # Quality assurance documentation
│   ├── 01_TEST_STRATEGY.md
│   ├── 02_TEST_CASE_TEMPLATE.md
│   ├── 03_ACCEPTANCE_CRITERIA.md
│   └── ...
│
├── schema.sql                     # Database schema
├── setup-database.sql             # Database initialization scripts
└── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Java 17+, Node.js 18+, Python 3.9+
- PostgreSQL 13+ (if not using Docker)
- Redis (if not using Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/iting-repo/iting.git
cd iting

# Copy environment configuration
cp deploy/.env.local.example deploy/.env.local

# Start all services
docker-compose -f deploy/docker-compose.local.yml up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# ML Service: http://localhost:8000
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Option 2: Local Development Setup

#### Backend (Spring Boot)
```bash
cd ITing-backend

# Build the project
./gradlew clean build

# Run the application
./gradlew bootRun

# Or with Maven
mvn clean install
mvn spring-boot:run
```

#### Frontend (React)
```bash
cd ITing-frontend

# Install dependencies
npm install

# Development server (with hot reload)
npm start

# Production build
npm build
```

#### ML Service (Python FastAPI)
```bash
cd ITing-ml

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python -m app.main
```

---

## 🌐 Deployment

### AWS Deployment

The platform is designed for AWS deployment with the following architecture:

- **Compute**: EC2 instances with Docker Engine
- **Database**: RDS PostgreSQL for data persistence
- **Storage**: S3 for file uploads (resumes, documents)
- **Cache**: ElastiCache Redis for caching and rate limiting
- **Message Queue**: Managed Kafka for event streaming
- **Registry**: ECR for Docker image storage

### Deployment Steps

For detailed deployment instructions, refer to [deploy_plan/](deploy_plan/):

1. [AWS Infrastructure Setup](deploy_plan/01_aws_infrastructure.md)
2. [Docker Foundation](deploy_plan/02_docker_foundation.md)
3. [RDS PostgreSQL](deploy_plan/03_rds_postgresql.md)
4. [Redis Caching](deploy_plan/04_redis_caching_ratelimiting.md)
5. [Kafka & Zookeeper](deploy_plan/05_kafka_zookeeper.md)
6. [Nginx SSL/Certbot](deploy_plan/06_nginx_ssl_certbot.md)
7. [Backend Deployment](deploy_plan/07_backend_deployment.md)
8. [Frontend Deployment](deploy_plan/08_frontend_deployment.md)
9. [Monitoring Setup](deploy_plan/09_prometheus_node_exporter_grafana.md)
10. [CI/CD Pipeline](deploy_plan/13_github_actions_cicd.md)

### CI/CD Pipeline

GitHub Actions automatically:
- Runs tests on every push
- Builds Docker images
- Pushes to GHCR (GitHub Container Registry)
- Deploys to AWS on main branch
- Performs code quality checks

---

## 📚 API Documentation

### Swagger UI
Access interactive API documentation at:
- Development: `http://localhost:8080/swagger-ui.html`
- Production: `https://your-domain.com/swagger-ui.html`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

#### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job (Admin/Company)
- `GET /api/jobs/{id}` - Get job details
- `PUT /api/jobs/{id}` - Update job (Admin/Company)
- `DELETE /api/jobs/{id}` - Delete job (Admin/Company)

#### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications` - List user applications
- `GET /api/applications/{id}` - Get application details

#### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `GET /api/users/{id}/applications` - User applications

#### ML/Search
- `POST /api/search/semantic` - Semantic job search
- `POST /api/candidates/extract-skills` - Extract skills from text
- `POST /api/jobs/rerank` - AI-powered job reranking

### Testing APIs
- API test guide: [ITing-backend/instructions/API_TEST_GUIDE.md](ITing-backend/instructions/API_TEST_GUIDE.md)
- RBAC testing: [ITing-backend/instructions/RBAC_API_TESTING_GUIDE.md](ITing-backend/instructions/RBAC_API_TESTING_GUIDE.md)

---

## 🏛️ Architecture

### System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS (443)
       ▼
┌─────────────────────────────┐
│     Nginx Reverse Proxy     │
│   (SSL/TLS + Load Balance)  │
└──┬──────────────────────┬───┘
   │                      │
   ▼                      ▼
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │
│  (React)    │    │ (Spring Boot)
└─────────────┘    └──────┬──────┘
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
   ┌────────┐         ┌────────┐         ┌────────┐
   │   RDS  │         │ Redis  │         │ Kafka  │
   │  (DB)  │         │ (Cache)│         │ (MQ)   │
   └────────┘         └────────┘         └────────┘
       ▼
   ┌────────┐
   │   S3   │
   │(Storage)
   └────────┘

ML Service (Separate Container)
├── Embeddings
├── Reranking
└── Skill Extraction
```

### Domain-Based Architecture

The backend follows a modular monolith pattern with domain-driven design:

```
Backend Service
├── auth-service          # Authentication & Authorization
├── user-service          # User profile management
├── job-service           # Job listings & management
├── company-service       # Company profiles
├── application-service   # Job applications
├── notification-service  # Notifications & Messaging
├── admin-service         # Administrative functions
└── shared                # Common utilities & configurations
```

---

## 👨‍💻 Development

### Frontend Development

```bash
cd ITing-frontend

# Install dependencies
npm install

# Development server with hot reload
npm start

# Run linter
npm run lint

# Format code
npm run format

# Run E2E tests
npm run test:e2e

# View test report
npm run test:e2e:report
```

### Backend Development

```bash
cd ITing-backend

# Run with Gradle
./gradlew clean build
./gradlew bootRun

# Run tests
./gradlew test

# Run specific test class
./gradlew test --tests com.iting.jobportal.auth.AuthServiceTest

# Generate API documentation
./gradlew javadoc
```

### Code Quality

- **Linting**: ESLint for frontend, SonarQube integration for backend
- **Formatting**: Prettier for frontend, Google Java Format for backend
- **Testing**: JUnit 5 + Mockito for backend, Playwright for E2E tests
- **Coverage**: Configured via Gradle/Maven

### Database

#### Local Development
```bash
# Initialize database
psql -U postgres -f schema.sql -f setup-database.sql

# Access database
psql -U iting_user -d iting_db
```

#### DBeaver Connection
See [ITing-backend/instructions/DBEAVER_CONNECTION_GUIDE.md](ITing-backend/instructions/DBEAVER_CONNECTION_GUIDE.md)

---

## 📊 Monitoring & Logging

### Monitoring Stack

| Service | Port | Purpose |
|---------|------|---------|
| Prometheus | 9090 | Metrics collection |
| Grafana | 3000 | Metrics visualization |
| Loki | 3100 | Log aggregation |
| Tempo | 3200 | Distributed tracing |
| Alertmanager | 9093 | Alert management |

### Accessing Monitoring Tools

```bash
# Prometheus
http://localhost:9090

# Grafana (default user: admin/admin)
http://localhost:3000

# Loki
http://localhost:3100

# Tempo
http://localhost:3200

# Alertmanager
http://localhost:9093
```

### Key Metrics

- Backend:
  - HTTP request latency
  - Database query performance
  - Cache hit rates
  - Authorization failures

- Frontend:
  - Page load time
  - Component render time
  - Network requests
  - Error rates

### Logs

Logs are aggregated using the Loki stack:
- **Log Shipping**: Promtail collects logs from containers
- **Log Aggregation**: Loki stores and indexes logs
- **Log Visualization**: Grafana queries and displays logs

---

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Java backend services
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: User workflows using Playwright
- **Performance Tests**: Load testing and optimization

### Running Tests

```bash
# Backend - Unit tests
./gradlew test

# Backend - Integration tests
./gradlew test -PtestCategory=integration

# Frontend - E2E tests
npm run test:e2e

# Frontend - E2E with UI
npm run test:e2e:ui

# View E2E report
npm run test:e2e:report
```

### Test Documentation

- [TEST_PLAN/01_TEST_STRATEGY.md](TEST_PLAN/01_TEST_STRATEGY.md)
- [ITing-backend/instructions/API_TEST_GUIDE.md](ITing-backend/instructions/API_TEST_GUIDE.md)
- [ITing-frontend/playwright.config.js](ITing-frontend/playwright.config.js)

---

## 🔐 Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Refresh Token Rotation**: Automatic token refresh mechanism
- **RBAC**: Fine-grained role-based access control
- **OAuth 2.0**: Google OAuth integration for social login

### Security Best Practices

- HTTPS/TLS encryption for all communications
- SQL injection prevention via parameterized queries (JPA)
- XSS protection with Content Security Policy headers
- CSRF token validation for state-changing operations
- Password hashing with bcrypt

### Sensitive Data

Sensitive configuration is managed via environment variables:
- Database credentials
- JWT secrets
- AWS credentials
- API keys (Google OAuth, etc.)

See [deploy/.env.local.example](deploy/.env.local.example) for required environment variables.

---

## 📖 Documentation

### Comprehensive Documentation

- [Backend Overview](ITing-backend/instructions/PROJECT_OVERVIEW.md)
- [Database Schema](schema.sql) & [ERD Analysis](ITing-backend/instructions/ERD_ANALYSIS.md)
- [API Testing Guide](ITing-backend/instructions/API_TEST_GUIDE.md)
- [Deployment Guide](ITing-backend/instructions/DEPLOYMENT_GUIDE.md)
- [RBAC & Permissions](ITing-backend/instructions/rbac_validation_rules.md)
- [Class Diagrams](ITing-backend/instructions/CLASS_DIAGRAM_GUIDE.md)
- [Thesis Documentation](docs/thesis/)

### Diagram Resources

- UML Class Diagrams: [CLASS_DIAGRAM_GUIDE.md](ITing-backend/instructions/CLASS_DIAGRAM_GUIDE.md)
- Architecture Diagrams: [05-architecture-class-diagram.md](docs/thesis/05-architecture-class-diagram.md)
- Entity Relationship Diagram: [ERD_ANALYSIS.md](ITing-backend/instructions/ERD_ANALYSIS.md)
- Use Case Analysis: [USE_CASE_ANALYSIS.md](ITing-backend/instructions/USE_CASE_ANALYSIS.md)

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a Pull Request with detailed description

### Code Standards

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Run linters and formatters before committing

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address code review comments
5. Merge after approval

---

## 📝 License

This project is licensed under the ISC License - see individual component licenses for details.

---

## 🆘 Support & Help

### Getting Help

- **Documentation**: Check the [docs/](docs/) and [ITing-backend/instructions/](ITing-backend/instructions/) directories
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Discussions**: Join project discussions for questions and community support

### Troubleshooting

- Database connection issues: [DBEAVER_CONNECTION_GUIDE.md](ITing-backend/instructions/DBEAVER_CONNECTION_GUIDE.md)
- Docker setup problems: [DOCKER_SETUP_README.md](ITing-backend/instructions/DOCKER_SETUP_README.md)
- Deployment issues: [DEPLOYMENT_GUIDE.md](ITing-backend/instructions/DEPLOYMENT_GUIDE.md)

---

## 🎓 Academic References

This project is associated with academic research and includes comprehensive thesis documentation:

- [Thesis Overview](docs/thesis/bao-cao-trien-khai-iting.md) - Vietnamese thesis deployment report
- [Technology Stack](docs/thesis/04-cong-nghe-su-dung.md) - Technology documentation
- [Architecture](docs/thesis/05-architecture-class-diagram.md) - System architecture diagrams

---

## 📞 Contact

For questions or inquiries:
- **Project Repository**: [github.com/iting-repo/iting](https://github.com/iting-repo/iting)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Last Updated**: 2026-06-25
**Maintained by**: ITing Development Team
