# ITing Deployment Plan - Overview

## Architecture Diagram

```
                          ┌─────────────────────────────────────────────────┐
                          │              AWS (ap-southeast-1)               │
                          │                                                   │
  Internet                │  ┌─────────── m7i-flex.large (8GB) ──────────┐ │
    │                     │  │                                           │ │
    ▼                     │  │  ┌─────────────────────────────────────┐  │ │
┌──────────┐             │  │  │       Nginx (Reverse Proxy)         │  │ │
│  Route53 │─────────────┼──┼──┤  :80 → :443 (SSL redirect)          │  │ │
│  Domain  │             │  │  │  :443 → backend/:8080               │  │ │
└──────────┘             │  │  │         → frontend/:80               │  │ │
                          │  │  │         → grafana/:3000             │  │ │
                          │  │  │         → portainer/:9000           │  │ │
                          │  │  │  Let's Encrypt + Certbot            │  │ │
                          │  │  └──────────────┬──────────────────────┘  │ │
                          │  │                 │                         │ │
                          │  │  ┌──────────────┴──────────────────────┐ │ │
                          │  │  │        Docker Network (iting-net)   │ │ │
                          │  │  │                                      │ │ │
                          │  │  │  ┌────────────┐  ┌──────────────┐  │ │ │
                          │  │  │  │  Backend    │  │  Frontend     │  │ │ │
                          │  │  │  │  :8080      │  │  :80 (Nginx)  │  │ │ │
                          │  │  │  │  Spring Boot│  │  React SPA    │  │ │ │
                          │  │  │  │  OTel Agent │  │              │  │ │ │
                          │  │  │  └──────┬─────┘  └──────────────┘  │ │ │
                          │  │  │         │                          │ │ │
                          │  │  │  ┌──────┴──────┐  ┌─────────────┐ │ │ │
                          │  │  │  │   Kafka     │  │    Redis     │ │ │ │
                          │  │  │  │   :9092      │  │    :6379     │ │ │ │
                          │  │  │  │ + Zookeeper │  │  Cache+Rate  │ │ │ │
                          │  │  │  └─────────────┘  └─────────────┘ │ │ │
                          │  │  │                                    │ │ │
                          │  │  │  ┌──────────────────────────────┐ │ │ │
                          │  │  │  │    Observability Stack        │ │ │ │
                          │  │  │  │                               │ │ │ │
                          │  │  │  │  Prometheus :9090             │ │ │ │
                          │  │  │  │  Node Exporter :9100          │ │ │ │
                          │  │  │  │  Grafana :3000                │ │ │ │
                          │  │  │  │  Loki :3100                   │ │ │ │
                          │  │  │  │  Promtail                     │ │ │ │
                          │  │  │  │  Tempo :3200                  │ │ │ │
                          │  │  │  │  OTel Collector :4317/:4318   │ │ │ │
                          │  │  │  │  Alertmanager :9093           │ │ │ │
                          │  │  │  └──────────────────────────────┘ │ │ │
                          │  │  │                                    │ │ │
                          │  │  │  ┌─────────────┐                  │ │ │
                          │  │  │  │  Portainer   │                  │ │ │
                          │  │  │  │  :9000       │                  │ │ │
                          │  │  │  └─────────────┘                  │ │ │
                          │  │  └──────────────────────────────────┘ │ │
                          │  └─────────────────────────────────────────┘ │
                          │                                                   │
                          │  ┌──────────── RDS PostgreSQL ─────────────┐ │
                          │  │  jobweb.cbkcwwk8ug43.ap-southeast-1     │ │
                          │  │  Existing RDS instance (already in use)  │ │
                          │  │  iting_job_portal database              │ │
                          │  │  Private subnet, Security Group locked  │ │
                          │  └─────────────────────────────────────────┘ │
                          └─────────────────────────────────────────────────┘

                          ┌─────────────────────────────────────────────┐
                          │           GitHub Actions CI/CD              │
                          │                                             │
                          │  Push/PR ──► Build ──► Test ──► Scan ──►  │
                          │    │                                    │   │
                          │    ├── Semgrep (SAST)                    │   │
                          │    ├── Trivy (Container Scan)            │   │
                          │    ├── Super-Linter (Lint)               │   │
                          │    └── Deploy to EC2 (tagged releases)   │   │
                          └─────────────────────────────────────────────┘
```

## Execution Order

The tasks MUST be completed in this order due to dependencies:

```
Phase 1: Foundation (Tasks 01-03)
  ├─ 01_aws_infrastructure.md        → EC2 (Ubuntu 24.04), VPC, Security Groups, configure existing RDS/S3
  ├─ 02_docker_foundation.md          → Docker, Compose, Networks, Volumes
  └─ 03_rds_postgresql.md            → Create app user on existing RDS, run migrations

Phase 2: Core Services (Tasks 04-08)
  ├─ 04_redis_caching_ratelimiting.md → Redis config + backend rate limiting migration
  ├─ 05_kafka_zookeeper.md            → Message queue setup
  ├─ 06_nginx_ssl_certbot.md         → Reverse proxy + SSL (prerequisite for apps)
  ├─ 07_backend_deployment.md        → Spring Boot container + OTel agent
  └─ 08_frontend_deployment.md       → React container + Nginx serving

Phase 3: Observability (Tasks 09-12)
  ├─ 09_prometheus_node_exporter_grafana.md  → Metrics collection + dashboards
  ├─ 10_loki_promtail.md                     → Log aggregation
  ├─ 11_opentelemetry_tempo.md                → Distributed tracing
  └─ 12_alertmanager_discord.md               → Alerting + Discord notifications

Phase 4: CI/CD & Management (Tasks 13-16)
  ├─ 13_github_actions_cicd.md        → CI/CD pipeline
  ├─ 14_code_quality_cicd.md         → Semgrep + Trivy + Super-Linter
  ├─ 15_portainer.md                 → Container management UI
  └─ 16_final_compose_integration.md  → Complete compose assembly + smoke test
```

## Prerequisites

### Before Starting
- [ ] AWS account with programmatic access
- [ ] Registered domain name (for SSL/TLS)
- [ ] GitHub repository with admin access
- [ ] Discord server with webhook URL for alerts
- [ ] SSH key pair for EC2 access

### Required Local Tools
- [ ] Docker & Docker Compose v2
- [ ] AWS CLI v2 configured
- [ ] Git
- [ ] SSH client

### AWS Services Used
| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| EC2 m7i-flex.large | 2 vCPU, 8GB RAM, 30GB gp3 | ~$61/mo (On-Demand) |
| RDS (existing) | PostgreSQL, already in project | Already exists |
| Elastic IP | Static IP for EC2 | Free (when attached) |
| Route 53 | Hosted zone | $0.50/mo |
| ACM | SSL certificate | Free |
| CloudWatch | Basic monitoring | Free tier |

**Estimated Total: ~$62/mo** (EC2 m7i-flex.large + RDS already exists + EIP + Route 53)

## Memory Budget (m7i-flex.large - 8GB)

| Service | Container | Memory Limit | Memory Reserved |
|---------|-----------|-------------|-----------------|
| **Backend** | iting-backend | 768MB | 512MB |
| **Frontend** | iting-frontend | 64MB | 32MB |
| **Kafka** | kafka | 768MB | 512MB |
| **Zookeeper** | zookeeper | 256MB | 128MB |
| **Redis** | redis | 128MB | 64MB |
| **Nginx** | nginx-proxy | 64MB | 32MB |
| **Prometheus** | prometheus | 256MB | 128MB |
| **Node Exporter** | node-exporter | 32MB | 16MB |
| **Grafana** | grafana | 256MB | 128MB |
| **Loki** | loki | 128MB | 64MB |
| **Promtail** | promtail | 64MB | 32MB |
| **Tempo** | tempo | 256MB | 128MB |
| **OTel Collector** | otel-collector | 128MB | 64MB |
| **Alertmanager** | alertmanager | 64MB | 32MB |
| **Portainer** | portainer | 128MB | 64MB |
| **Certbot** | certbot | 32MB | 16MB |
| **Total Containers** | | ~3.4GB | ~1.9GB |
| **OS + System** | | ~1.5GB | |
| **Total** | | ~4.9GB | |
| **Available Buffer** | | ~3.1GB (38%) | |

## Network Architecture

```
Network: iting-net (bridge driver)
├── Subnet: 172.28.0.0/16
├── Gateway: 172.28.0.1
├── Services:
│   ├── nginx-proxy    → 172.28.0.2
│   ├── backend        → 172.28.0.3
│   ├── frontend       → 172.28.0.4
│   ├── redis          → 172.28.0.5
│   ├── kafka          → 172.28.0.6
│   ├── zookeeper      → 172.28.0.7
│   ├── prometheus     → 172.28.0.10
│   ├── grafana        → 172.28.0.11
│   ├── loki           → 172.28.0.12
│   ├── tempo          → 172.28.0.13
│   ├── otel-collector → 172.28.0.14
│   ├── alertmanager   → 172.28.0.15
│   └── portainer      → 172.28.0.20
```

## Port Mapping

| External | Internal | Service | Protocol |
|----------|----------|---------|----------|
| 80 | 80 | Nginx (HTTP → HTTPS redirect) | TCP |
| 443 | 443 | Nginx (HTTPS) | TCP |
| 22 | - | SSH | TCP |
| 8080 | - | Backend (via Nginx only) | HTTP |
| 3000 | - | Grafana (via Nginx only) | HTTP |
| 9090 | - | Prometheus (via Nginx only) | HTTP |
| 9093 | - | Alertmanager (internal only) | HTTP |
| 9000 | - | Portainer (via Nginx only) | HTTP |

> **Security Note**: Only ports 22, 80, and 443 should be exposed externally. All other services accessed through Nginx reverse proxy with authentication.

## Environment Variables

All secrets are stored in `.env` on the server (never committed to Git):

```env
# Domain
DOMAIN=datnhk252iting.dpdns.org
API_DOMAIN=api.datnhk252iting.dpdns.org
MONITOR_DOMAIN=monitor.datnhk252iting.dpdns.org


# Database (RDS) - already exists
DB_HOST=jobweb.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=iting_job_portal
DB_USERNAME=iting_app
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<256-bit-hex-secret>
JWT_EXPIRATION=86400000
JWT_REFRESH_SECRET=<512-bit-hex-secret>
JWT_REFRESH_EXPIRATION=604800000

# Redis
REDIS_PASSWORD=<strong-password>

# AWS S3 - bucket already exists
AWS_ACCESS_KEY=<access-key>
AWS_SECRET_KEY=<secret-key>
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=datn-jobweb

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<email>
MAIL_PASSWORD=<app-password>

# Google OAuth
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<secret>

# Discord Webhook
DISCORD_WEBHOOK_URL=<webhook-url>


# Grafana
GF_ADMIN_PASSWORD=<strong-password>

# Portainer
PORTAINER_PASSWORD=<strong-password>
```

## Related Project Files

| File | Purpose |
|------|---------|
| `ITing-backend/.env` | Local dev environment (contains existing RDS endpoint & S3 credentials) |
| `ITing-backend/.env.production` | Production environment template |
| `deploy/` | Deployment configs and docker-compose (local-first, pushed to GitHub) |
| `ITing-backend/Dockerfile` | Backend container definition |
| `ITing-backend/docker-compose.yml` | Existing Docker Compose (local dev) |
| `ITing-backend/.env.example` | Environment variable template |
| `ITing-backend/build.gradle` | Build configuration (Spring Boot 3.2.1) |
| `ITing-backend/deploy.sh` | Existing deployment script (EC2) |
| `ITing-frontend/package.json` | Frontend dependencies |
| `ITing-frontend/webpack.config.js` | Frontend build config |

## Related .opencode Skills

| Skill | Path | Relevance |
|-------|------|-----------|
| CI/CD | `.opencode/skills/ci-cd/` | GitHub Actions pipeline design |
| Monitoring & Observability | `.opencode/skills/monitoring-observability/` | Prometheus, Grafana, Loki, Tempo setup |
| ECS | `.opencode/skills/ecs/` | Container orchestration reference |
| DevOps Core Principles | `.opencode/rules/devops-core-principles.instructions.md` | CALMS framework, DORA metrics |
| DevOps Expert Agent | `.opencode/agents/devops-expert.agent.md` | DevOps Infinity Loop guidance |
| GitHub Actions Spec | `.opencode/create-github-action-workflow-specification/` | Workflow specification template |

## Rollback Strategy

Each task includes rollback instructions. The general rollback strategy:

1. **Infrastructure**: Use AWS snapshots and AMIs (do NOT delete existing RDS)
2. **Docker**: Use `docker-compose down` and restore from previous image tags
3. **Database**: Use existing RDS automated backups (already configured)
4. **Configuration**: All configs version-controlled in Git
5. **SSL**: Certbot auto-renewals with `/etc/letsencrypt/` backups
