# Task 13: GitHub Actions CI/CD Pipeline

## Objective

Set up a simple, non-conflicting CI/CD pipeline using two separate workflows:
- **`ci.yml`**: Build, test, scan, and push Docker images (on every push/PR)
- **`deploy.yml`**: Deploy to EC2 (only on tags `v*`)

## Prerequisites

- GitHub repository with admin access
- EC2 instance running with SSH access
- All Docker services configured (Tasks 04-12)

## Step-by-Step Instructions

### 13.1 Create GitHub Repository Secrets

Go to GitHub → Settings → Secrets and variables → Actions, and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | `<Elastic-IP>` | EC2 public IP |
| `EC2_SSH_KEY` | `<private-key>` | SSH private key for EC2 |
| `GHCR_USERNAME` | `<github-username>` | GHCR login user |
| `GHCR_TOKEN` | `<token with read:packages>` | GHCR pull token for EC2 deploy |
| `DISCORD_WEBHOOK_URL` | `<discord-webhook>` | Discord webhook for notifications |

> Note: No AWS OIDC role needed. We use SSH for deployment, not AWS APIs.

### 13.2 Workflow Files (Already Created)

The following files are already in your repository:

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/ci.yml` | Build, test, scan, push images | Push to main/develop, PRs, tags |
| `.github/workflows/deploy.yml` | Deploy to EC2 | Tags only (`v*`) |

### 13.3 CI Pipeline Flow

```
Push to main/develop
        │
        ├── Backend: Build + Test
        ├── Frontend: Build + Test
        ├── Security: Trivy Scan
        └── Docker: Build + Push to GHCR
```

### 13.4 Deploy Pipeline Flow

```
Push tag (v1.0.0)
        │
        ├── SSH into EC2
        ├── Pull latest images from GHCR
        ├── docker compose up -d
        ├── Health check
        └── Notify Discord
```

## Verification

```bash
# Test CI pipeline
git push origin main

# Test deploy pipeline
git tag v1.0.0
git push origin v1.0.0

# Check workflow status
gh run list --limit 5
gh run view <run-id>
```

## Rollback

```bash
# On EC2, rollback to a previous image tag
ssh -i key.pem ubuntu@$EC2_IP

/opt/iting/iting-repo/deploy/scripts/deploy.sh rollback abc1234

# Then manually update .env:
# BACKEND_IMAGE=ghcr.io/.../iting-backend:abc1234
# FRONTEND_IMAGE=ghcr.io/.../iting-frontend:abc1234

/opt/iting/iting-repo/deploy/scripts/deploy.sh deploy
```

## References

- `deploy/docker-compose.yml` - Complete production compose
- `deploy/.env.example` - All required variables
- `deploy/scripts/deploy.sh` - Manual deploy script
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/deploy.yml` - Deploy pipeline
