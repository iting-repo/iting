# ITing Deployment Configuration

All deployment configs are managed locally and committed to Git. EC2 only receives secrets and pulls images.

## Structure

```
deploy/
├── docker-compose.yml          ← Complete production compose
├── .env.example                ← Template (commit this)
├── .env.prod                   ← Env flag (commit this)
├── .gitignore                  ← Ignores real .env files
├── config/                     ← Service configs
│   ├── nginx/                  ← Reverse proxy
│   ├── redis/                  ← Redis config
│   ├── kafka/                  ← Kafka config
│   ├── otel/                   ← OpenTelemetry
│   └── alertmanager-discord/   ← Discord webhook bridge
├── monitoring/                 ← Observability stack
│   ├── prometheus/             ← Metrics + alerts
│   ├── grafana/                ← Dashboards
│   ├── loki/                   ← Logs
│   ├── tempo/                  ← Traces
│   └── alertmanager/           ← Alert routing
└── scripts/
    ├── setup-ec2.sh            ← One-time EC2 init
    └── deploy.sh               ← Manual deploy/rollback
```

## Workflow

### Local Development (same Dockerfiles/Compose as CI)
1. Copy env template:
   - `cp deploy/.env.local.example deploy/.env.local`
2. Build and run core stack locally:
   - `docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.local.yml --env-file deploy/.env.local up -d --build redis zookeeper kafka backend frontend`
3. Access:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8081`
4. Stop local stack:
   - `docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.local.yml --env-file deploy/.env.local down`

### EC2 (One-Time Setup)
```bash
ssh -i key.pem ubuntu@IP "bash -s" < deploy/scripts/setup-ec2.sh
```

### EC2 (Manual Deploy)
```bash
ssh -i key.pem ubuntu@IP
/opt/iting/iting-repo/deploy/scripts/deploy.sh deploy
```

## Secrets

| File | Location | Committed? |
|------|----------|------------|
| `.env.example` | `deploy/` | ✅ Yes |
| `.env` | `/opt/iting/.env` on EC2 | ❌ No |
| `.env.prod` | `deploy/` + `/opt/iting/.env.prod` | ✅ Yes (no secrets) |
| `.env.local.example` | `deploy/` | ✅ Yes |
| `.env.local` | `deploy/` | ❌ No |

## CI/CD

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | Push to main/develop, PRs, tags | Build, test, scan, push images |
| `deploy.yml` | Tags only (`v*`) | Deploy to EC2 via SSH |

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 public IP |
| `EC2_SSH_KEY` | SSH private key |
| `GHCR_USERNAME` | GitHub username with package read access |
| `GHCR_TOKEN` | GitHub token/PAT with `read:packages` |
| `DISCORD_WEBHOOK_URL` | Discord notifications |
