# Task 08: Frontend Deployment (React + Nginx)

## Objective

Create a production Docker image for the ITing React frontend with multi-stage build, Nginx for serving the SPA, and integrate it with the reverse proxy setup from Task 06.

## Prerequisites
- Task 02 completed (Docker foundation)
- Task 06 completed (Nginx reverse proxy with SSL)

## Step-by-Step Instructions

### 8.1 Create Frontend Dockerfile

Create `ITing-frontend/Dockerfile`:

```dockerfile
# ==========================================
# ITing Frontend - Production Dockerfile
# Multi-stage build: Node.js build + Nginx serving
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL (injected at build time)
ARG REACT_APP_API_BASE_URL=https://api.datnhk252iting.dpdns.org/api
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Build production bundle
RUN npm run build

# Stage 2: Nginx serving stage
FROM nginx:1.25-alpine

# Remove default Nginx configs
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Security: Run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 8.2 Create Frontend Nginx Configuration

Create `ITing-frontend/docker/nginx.conf` (local):

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/rss+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA routing: serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

### 8.3 Create .dockerignore for Frontend

Create `ITing-frontend/.dockerignore`:

```
node_modules
dist
.git
.gitignore
.env
.env.local
.env.*.local
*.md
.vscode
.idea
e2e
playwright-report
test-results
npm-debug.log
```

### 8.4 Build and Test Frontend Docker Image Locally

```bash
cd ITing-frontend

# Build the Docker image with production API URL
docker build \
  --build-arg REACT_APP_API_BASE_URL=https://api.datnhk252iting.dpdns.org/api \
  -t iting-frontend:latest .

# Test locally
docker run -d --name iting-frontend-test \
  -p 3000:80 \
  iting-frontend:latest

# Verify it serves the frontend
curl -f http://localhost:3000/
# Expected: HTML response with ITing frontend

# Verify health check
curl -f http://localhost:3000/health
# Expected: OK

# Check SPA routing works
curl -f http://localhost:3000/login
# Expected: Returns index.html (200 OK)

# Clean up
docker stop iting-frontend-test && docker rm iting-frontend-test
```

### 8.5 CI/CD Image Publishing (Local-First)

CI/CD will build and push the frontend image to GHCR. EC2 pulls the image during the deploy job (no SCP of images).

### 8.6 Add Frontend Service to docker-compose.yml

```bash
cat >> ./deploy/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Frontend - React SPA with Nginx
  # ========================================
  frontend:
    image: ${FRONTEND_IMAGE}
    container_name: iting-frontend
    restart: unless-stopped
    networks:
      - iting-net
    environment:
      REACT_APP_API_BASE_URL: ${REACT_APP_API_BASE_URL}
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    deploy:
      resources:
        limits:
          memory: 64M
        reservations:
          memory: 32M
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "3"
COMPOSEEOF
```

### 8.7 Start Frontend and Verify

```bash
cd /opt/iting/iting-repo/deploy

# Start frontend
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d frontend

# Wait for startup
sleep 5

# Verify frontend container
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps frontend

# Test frontend directly
curl -f http://localhost:80/ | head -20
# Expected: HTML with ITing frontend

# Test health endpoint
curl -f http://localhost:80/health
# Expected: OK

# Test through Nginx (after Task 06)
curl -f https://datnhk252iting.dpdns.org/
# Expected: ITing frontend

# Test SPA routing
curl -f https://datnhk252iting.dpdns.org/login
# Expected: Returns index.html

# Verify API proxy through same origin
curl -f https://datnhk252iting.dpdns.org/api/actuator/health
# Expected: Backend health response
```

## Verification

```bash
# Container is running
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps frontend

# Frontend serves HTML
curl -s http://frontend/ | head -5

# Health check passes
docker inspect iting-frontend | jq '.[0].State.Health'

# SPA routing works (non-root paths return index.html)
curl -s http://frontend/login | grep -o '<title>.*</title>'

# Static assets load
curl -I http://frontend/static/js/main.js

# SSL works through Nginx
curl -I https://datnhk252iting.dpdns.org/

# API proxy works
curl https://datnhk252iting.dpdns.org/api/actuator/health
```

## Rollback

```bash
# Stop frontend
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down frontend

# Revert to previous image
docker tag iting-frontend:previous iting-frontend:latest

# Remove image
docker rmi iting-frontend:latest
```

## References

- `ITing-frontend/package.json` - Frontend dependencies and scripts
- `ITing-frontend/webpack.config.js` - Webpack build configuration
- `ITing-frontend/src/utils/axiosInstance.js` - API configuration (may need API URL update)
- `ITing-frontend/src/utils/jobUrl.js` - Job URL utility (may need hardcoded localhost removal)
