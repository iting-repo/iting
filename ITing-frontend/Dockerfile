# ==========================================
# ITing Frontend Dockerfile
# Single source for local + CI/CD
# ==========================================

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject build-time env for production bundle (webpack reads .env.production)
ARG VITE_API_BASE=https://datnhk252iting.dpdns.org
ARG REACT_APP_GOOGLE_CLIENT_ID
RUN printf "VITE_API_BASE=%s\nREACT_APP_GOOGLE_CLIENT_ID=%s\n" \
    "$VITE_API_BASE" "$REACT_APP_GOOGLE_CLIENT_ID" > .env.production

# Build with webpack production mode
RUN npm run build -- --env APP_ENV=production

FROM nginx:1.25-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Copy public/ first (raw assets: favicon, *.png, *.svg, ...) — webpack không tự copy.
# Sau đó dist/ override index.html (đã được HtmlWebpackPlugin process).
COPY --from=build /app/public/ /usr/share/nginx/html/
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
