#!/bin/bash
# ==========================================
# ITing Deploy Script (Manual Use on EC2)
# ==========================================
# Use this for manual deploys, rollbacks, or restarts.
# CI/CD handles automatic deploys via tags.

set -e

COMPOSE_FILE="/opt/iting/iting-repo/deploy/docker-compose.yml"
ENV_FILE="/opt/iting/.env"
ENV_PROD="/opt/iting/.env.prod"

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --env-file "$ENV_PROD" "$@"
}

echo "=== ITing Deploy Script ==="

case "$1" in
  deploy)
    echo "Pulling latest images..."
    compose pull
    echo "Deploying..."
    compose up -d --remove-orphans
    echo "Cleaning up..."
    docker image prune -f
    echo "Done. Checking status..."
    compose ps
    ;;

  restart)
    echo "Restarting all services..."
    compose restart
    ;;

  stop)
    echo "Stopping all services..."
    compose down
    ;;

  logs)
    if [ -z "$2" ]; then
      compose logs --tail=100 -f
    else
      compose logs --tail=100 -f "$2"
    fi
    ;;

  status)
    compose ps
    ;;

  rollback)
    if [ -z "$2" ]; then
      echo "Usage: $0 rollback <image-tag>"
      echo "Example: $0 rollback abc1234"
      exit 1
    fi
    TAG="$2"
    echo "Rolling back to tag: $TAG"
    echo "Update .env BACKEND_IMAGE and FRONTEND_IMAGE to use tag: $TAG"
    echo "Then run: $0 deploy"
    ;;

  *)
    echo "Usage: $0 {deploy|restart|stop|logs [service]|status|rollback <tag>}"
    exit 1
    ;;
esac
