#!/bin/bash
set -euo pipefail
exec > >(tee /var/log/user-data.log) 2>&1

echo "▶️  StartupSaarthi bootstrap — $(date)"

# ── System updates ───────────────────────────────────────────
dnf update -y
dnf install -y docker git curl aws-cli jq

# ── Docker setup ─────────────────────────────────────────────
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ── Install Docker Compose v2 ─────────────────────────────────
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# ── ECR Login ─────────────────────────────────────────────────
AWS_REGION="${aws_region}"
ECR_REGISTRY="${ecr_registry}.dkr.ecr.$${AWS_REGION}.amazonaws.com"

aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

# ── Fetch secrets from AWS Secrets Manager ────────────────────
APP_NAME="${app_name}"
ENV="${environment}"

fetch_secret() {
  aws secretsmanager get-secret-value \
    --secret-id "$APP_NAME/$ENV/$1" \
    --region "$AWS_REGION" \
    --query SecretString \
    --output text
}

mkdir -p /opt/startupsaarthi
cat > /opt/startupsaarthi/.env <<EOF
NODE_ENV=production
DATABASE_URL=$(fetch_secret database_url)
REDIS_HOST=$(fetch_secret redis_host)
REDIS_PORT=6379
CLERK_SECRET_KEY=$(fetch_secret clerk_secret_key)
FRONTEND_URL=https://${app_name}.com
RAZORPAY_KEY_ID=$(fetch_secret razorpay_key_id)
RAZORPAY_KEY_SECRET=$(fetch_secret razorpay_key_secret)
RAZORPAY_WEBHOOK_SECRET=$(fetch_secret razorpay_webhook_secret)
ANTHROPIC_API_KEY=$(fetch_secret anthropic_api_key)
AWS_REGION=$AWS_REGION
S3_BUCKET_NAME=${app_name}-reports
IMAGE_TAG=latest
ECR_REGISTRY=$ECR_REGISTRY
EOF

# ── Pull and start services ───────────────────────────────────
cd /opt/startupsaarthi

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# ── Health check ───────────────────────────────────────────────
sleep 30
for i in {1..5}; do
  if curl -sf http://localhost:3001/health; then
    echo "✅ API healthy on attempt $i"
    break
  fi
  echo "⏳ Health check attempt $i/5 failed, retrying..."
  sleep 15
done

echo "✅ Bootstrap complete — $(date)"
