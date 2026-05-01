# Task 13: GitHub Actions CI/CD Pipeline

## Objective

Create a comprehensive GitHub Actions CI/CD pipeline that builds, tests, scans, and deploys the ITing application. The pipeline follows the DevOps Infinity Loop (`.opencode/agents/devops-expert.agent.md`) and uses OIDC for AWS authentication (`.opencode/skills/ci-cd/skills/SKILL.md`).

## Prerequisites
- GitHub repository with admin access
- AWS IAM role for GitHub Actions (created in Task 01)
- EC2 instance running with SSH access
- All Docker services configured (Tasks 04-12)

## Step-by-Step Instructions

### 13.1 Create GitHub Repository Secrets

Go to GitHub → Settings → Secrets and variables → Actions, and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/iting-github-actions` | OIDC role ARN |
| `AWS_REGION` | `ap-southeast-1` | AWS region |
| `EC2_INSTANCE_ID` | `<from-task-01>` | EC2 instance ID for deployment |
| `EC2_HOST` | `<Elastic-IP>` | EC2 public IP |
| `EC2_SSH_KEY` | `<private-key>` | SSH private key for EC2 |
| `DISCORD_WEBHOOK_URL` | `<discord-webhook>` | Discord webhook for notifications |

### 13.2 Create CI Pipeline

Create `.github/workflows/ci.yml` (deploys only on tags):

```yaml
---
name: CI Pipeline

on:
  push:
    branches: [main, develop]
    tags: ["v*"]
  pull_request:
    branches: [main]

permissions:
  contents: read
  id-token: write
  security-events: write

env:
  JAVA_VERSION: '17'
  NODE_VERSION: '20'
  REGISTRY: ghcr.io

jobs:
  # ========================================
  # Job 1: Backend Build & Test
  # ========================================
  backend-build-test:
    name: Backend Build & Test
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: 'gradle'
      
      - name: Cache Gradle packages
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: gradle-
      
      - name: Grant execute permission for gradlew
        working-directory: ITing-backend
        run: chmod +x gradlew
      
      - name: Build backend
        working-directory: ITing-backend
        run: ./gradlew bootJar --no-daemon
      
      - name: Run backend tests
        working-directory: ITing-backend
        run: ./gradlew test --no-daemon
      
      - name: Generate version
        id: version
        working-directory: ITing-backend
        run: echo "version=${GITHUB_SHA::7}" >> $GITHUB_OUTPUT
      
      - name: Upload backend JAR
        uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: ITing-backend/build/libs/*.jar
          retention-days: 5

  # ========================================
  # Job 2: Frontend Build & Test
  # ========================================
  frontend-build-test:
    name: Frontend Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: ITing-frontend/package-lock.json
      
      - name: Install frontend dependencies
        working-directory: ITing-frontend
        run: npm ci
      
      - name: Build frontend
        working-directory: ITing-frontend
        run: npm run build
        env:
          REACT_APP_API_BASE_URL: https://api.datnhk252iting.dpdns.org/api
      
      - name: Upload frontend build
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: ITing-frontend/dist/
          retention-days: 5

  # ========================================
  # Job 3: Security Scanning (Parallel)
  # ========================================
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: []
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Semgrep SAST
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/default
            p/java
            p/javascript
            p/owasp-top-ten
          publishToken: ${{ secrets.SEMGREP_APP_TOKEN }}
          publishDeployment: ${{ secrets.SEMGREP_DEPLOYMENT_ID }}
      
      - name: Trivy filesystem scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Secret scanning
        uses: gitleaks/gitleaks-action@v2
        env:
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}

  # ========================================
  # Job 4: Code Quality (Lint)
  # ========================================
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Super-Linter
        uses: super-linter/super-linter@v6
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          FILTER_REGEX_EXCLUDE: '.*node_modules/.*|.*\.gradle/.*|.*build/.*|.*dist/.*'
          JAVA_FILE_NAME: checkstyle.xml
          VALIDATE_JAVA: true
          VALIDATE_JAVASCRIPT_ES: true
          VALIDATE_CSS: true
          VALIDATE_HTML: true
          VALIDATE_JSON: true
          VALIDATE_YAML: true
          VALIDATE_DOCKERFILE_HADOLINT: true

  # ========================================
  # Job 5: Build Docker Images
  # ========================================
  docker-build:
    name: Build Docker Images (Tagged Releases)
    runs-on: ubuntu-latest
    needs: [backend-build-test, frontend-build-test]
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Download backend JAR
        uses: actions/download-artifact@v4
        with:
          name: backend-jar
          path: ITing-backend/build/libs/
      
      - name: Download frontend dist
        uses: actions/download-artifact@v4
        with:
          name: frontend-dist
          path: ITing-frontend/dist/
      
      - name: Extract metadata for backend
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/iting-backend
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./ITing-backend
          file: ./ITing-backend/Dockerfile.prod
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Extract metadata for frontend
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/iting-frontend
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./ITing-frontend
          file: ./ITing-frontend/Dockerfile
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          build-args: |
            REACT_APP_API_BASE_URL=https://api.datnhk252iting.dpdns.org/api
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ========================================
  # Job 6: Deploy to Production
  # ========================================
  deploy:
    name: Deploy to Production (Tagged Releases)
    runs-on: ubuntu-latest
    needs: [docker-build, security-scan, code-quality]
    if: startsWith(github.ref, 'refs/tags/')
    environment:
      name: production
      url: https://datnhk252iting.dpdns.org
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}
      
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/iting/iting-repo/deploy
            
            # Log in to GitHub Container Registry
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Pull latest images
            docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod pull
            
            # Deploy with zero-downtime
            docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d --remove-orphans
            
            # Clean up old images
            docker image prune -f
            
            # Verify deployment
            sleep 15
            docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps
      
      - name: Health check
        run: |
          sleep 30
          curl -sf https://datnhk252iting.dpdns.org/ || exit 1
          curl -sf https://api.datnhk252iting.dpdns.org/actuator/health || exit 1
      
      - name: Notify Discord - Success
        if: success()
        run: |
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"content":"✅ Deployment succeeded! Commit: ${{ github.sha::7 }} by ${{ github.actor }}"}'
      
      - name: Notify Discord - Failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"content":"🚨 Deployment FAILED! Commit: ${{ github.sha::7 }} by ${{ github.actor }}. Check: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}'
```

### 13.3 Create PR Preview Workflow

Create `.github/workflows/pr-preview.yml`:

```yaml
---
name: PR Preview

on:
  pull_request:
    branches: [main]

jobs:
  preview-check:
    name: Preview Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Backend build only (no test)
        working-directory: ITing-backend
        run: ./gradlew bootJar --no-daemon -x test
      
      - name: Frontend build only
        working-directory: ITing-frontend
        run: npm ci && npm run build
        env:
          REACT_APP_API_BASE_URL: https://api.datnhk252iting.dpdns.org/api
      
      - name: Docker backend build (no push)
        uses: docker/build-push-action@v5
        with:
          context: ./ITing-backend
          file: ./ITing-backend/Dockerfile.prod
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Docker frontend build (no push)
        uses: docker/build-push-action@v5
        with:
          context: ./ITing-frontend
          file: ./ITing-frontend/Dockerfile
          push: false
          build-args: |
            REACT_APP_API_BASE_URL=https://api.datnhk252iting.dpdns.org/api
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Verification

```bash
# Create and push a release tag to trigger deployment
git tag v1.0.0
git push origin v1.0.0

# Check pipeline status
gh run list --limit 5
gh run view <run-id>

# Verify all jobs pass:
# 1. Backend Build & Test ✅
# 2. Frontend Build & Test ✅
# 3. Security Scan ✅
# 4. Code Quality ✅
# 5. Docker Build ✅
# 6. Deploy to Production ✅

# Verify deployment on EC2
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP "docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps"
```

## Rollback

```bash
# On EC2, roll back to previous version:
cd /opt/iting

# Find previous image
docker images | grep iting-backend
docker images | grep iting-frontend

# Tag previous version as latest
docker tag ghcr.io/<org>/iting-backend:<previous-sha> ghcr.io/<org>/iting-backend:latest
docker tag ghcr.io/<org>/iting-frontend:<previous-sha> ghcr.io/<org>/iting-frontend:latest

# Redeploy
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d
```

## References

- `.opencode/skills/ci-cd/skills/SKILL.md` - CI/CD pipeline design patterns
- `.opencode/create-github-action-workflow-specification/SKILL.md` - Workflow specification template
- `.opencode/agents/devops-expert.agent.md` - DevOps Infinity Loop (Plan→Code→Build→Test→Release→Deploy→Operate→Monitor)
- `.opencode/rules/devops-core-principles.instructions.md` - DORA metrics guidance
