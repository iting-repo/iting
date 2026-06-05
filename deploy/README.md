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
| `.env.prod.example` | `deploy/` | ✅ Yes (template, no real secrets) |
| `.env.prod` | `/opt/iting/.env.prod` on EC2 | ❌ No (auto-injected by deploy.yml from GitHub secrets, chmod 600) |
| `.env.local.example` | `deploy/` | ✅ Yes |
| `.env.local` | `deploy/` | ❌ No |

## CI/CD

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | Push to main/develop, PRs, tags | Build, test, scan, push images |
| `deploy.yml` | Tags only (`v*`) | Deploy to EC2 via SSH |

## Required GitHub Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `EC2_HOST` | ✅ Yes | EC2 public IP |
| `EC2_SSH_KEY` | ✅ Yes | SSH private key |
| `GHCR_USERNAME` | ✅ Yes | GitHub username with package read access |
| `GHCR_TOKEN` | ✅ Yes | GitHub token/PAT with `read:packages` |
| `GHCR_PAT` | ✅ Yes | GitHub PAT for image manifest inspect (separate from deploy login) |
| `DISCORD_WEBHOOK_URL` | ✅ Yes | Discord notifications |
| `GEMINI_API_KEY` | ✅ Yes | Google AI Studio API key (https://aistudio.google.com/apikey). Used by CvScoringServiceImpl + GeminiCVParserService. |
| `GEMINI_API_URL` | ⬜ Optional | Override Gemini endpoint (default: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`) |
| `GEMINI_API_MODEL` | ⬜ Optional | Override model name (default: `gemini-2.5-flash`) |

### Cách set secrets

1. Vào repo GitHub: `https://github.com/iting-repo/iting/settings/secrets/actions`
2. Click **"New repository secret"**
3. Name: `GEMINI_API_KEY` (hoặc tên khác theo bảng trên)
4. Value: paste secret value
5. Click **"Add secret"**

### Auto-rotation flow

Mỗi lần push tag `v*` lên GitHub, workflow `deploy.yml` sẽ:

1. SSH vào EC2
2. Đọc secret từ GitHub Actions context (encrypted, không log)
3. Inject/rotate giá trị vào `/opt/iting/.env.prod` (idempotent — `sed` thay dòng cũ hoặc append dòng mới)
4. `chmod 600` để chỉ owner đọc được
5. `docker compose pull` images mới
6. `docker compose up -d` restart containers
7. Verify Gemini key injected (sanity check key length, không echo value)

Lần đầu deploy, file `.env.prod` chưa tồn tại → workflow sẽ `touch` tạo file rỗng, sau đó append. Idempotent nên chạy nhiều lần không gây duplicate.

### Test trước khi deploy

Sau khi inject key, có thể verify nhanh trong container:

```bash
ssh -i key.pem ubuntu@IP
docker exec -it iting-backend sh -c 'env | grep GEMINI'
```

Nếu thấy `GEMINI_API_KEY=...` (length > 0) → OK.
