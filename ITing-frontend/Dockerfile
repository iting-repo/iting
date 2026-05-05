# ==========================================
# ITing Frontend Dockerfile
# Single source for local + CI/CD
# ==========================================

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject API base for production bundle
ARG VITE_API_BASE=https://datnhk252iting.dpdns.org
RUN printf "VITE_API_BASE=%s\n" "$VITE_API_BASE" > .env.production

# Build with webpack production mode
RUN npm run build -- --env APP_ENV=production

FROM nginx:1.25-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
