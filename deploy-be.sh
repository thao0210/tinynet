#!/bin/bash
set -e

# ===== CONFIG =====
REMOTE_USER="deploy"
REMOTE_HOST="91.99.15.149"
REMOTE_APP_PATH="/var/www/tinynet/app"
PM2_APP_NAME="tinynet-backend"
ENV_LOCAL="./backend/.env"
ENV_REMOTE="${REMOTE_APP_PATH}/backend/.env"
FE_LOCAL_PATH="./frontend"
FE_BUILD_LOCAL="${FE_LOCAL_PATH}/dist"
FE_BUILD_REMOTE="/var/www/tinynet/fe_build"
# ==================

echo "=== 1. Push local code to GitHub ==="
git add .
if ! git diff --cached --quiet; then
    git commit -m "Auto deploy"
    git push origin main
else
    echo "No changes to commit. Skipping git push."
fi

echo "=== 2. SSH into VPS & pull latest code ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_APP_PATH} && git pull origin main
"

echo "=== 3. Copy .env to VPS backend/.env ==="
scp ${ENV_LOCAL} ${REMOTE_USER}@${REMOTE_HOST}:${ENV_REMOTE}

# Kiểm tra file .env trên VPS
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    if [ ! -f ${ENV_REMOTE} ]; then
        echo '.env file not found! Deployment aborted.'
        exit 1
    fi
    echo '.env file exists.'
"

echo "=== 4. Install backend dependencies on VPS ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_APP_PATH}/backend && npm install
"

echo "=== 5. Restart backend with PM2 (safe) ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_APP_PATH}/backend && \
    pm2 delete ${PM2_APP_NAME} || true && \
    pm2 start ecosystem.config.js --only ${PM2_APP_NAME} && \
    pm2 show ${PM2_APP_NAME}
"
echo "=== Deployment completed successfully! ==="
