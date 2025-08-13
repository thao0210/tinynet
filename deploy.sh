#!/bin/bash
set -e

# ===== CONFIG =====
REMOTE_USER="deploy"
REMOTE_HOST="91.99.15.149"
REMOTE_APP_PATH="/var/www/tinynet/app"
PM2_APP_NAME="tinynet-backend"
# ==================

echo "=== 1. Push local code to GitHub ==="
git add .
# Nếu có gì mới thì commit, nếu không thì bỏ qua
if ! git diff --cached --quiet; then
    git commit -m "Auto deploy"
    git push origin main
else
    echo "No changes to commit. Skipping git push."
fi

echo "=== 2. SSH into VPS & pull latest code ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_APP_PATH} && \
    git pull origin main
"

echo "=== 3. Copy .env.production from local to VPS backend/.env ==="
scp ./backend/.env.production ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_PATH}/backend/.env

echo "=== 4. Install backend dependencies on VPS ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_APP_PATH}/backend && \
    npm install
"

echo "=== 5. Restart backend with PM2 ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_APP_PATH}/backend && \
    pm2 stop ${PM2_APP_NAME} || true && \
    pm2 start ecosystem.config.js --only ${PM2_APP_NAME}
"

echo "=== 6. Deploy frontend build to VPS ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    rm -rf /var/www/tinynet/fe_build && \
    mkdir -p /var/www/tinynet/fe_build
"
scp -r ./fe_build/* ${REMOTE_USER}@${REMOTE_HOST}:/var/www/tinynet/fe_build/

echo "=== Deployment completed successfully! ==="
