#!/usr/bin/env bash
set -euo pipefail

if [ -f .env.deploy ]; then
  set -a
  . ./.env.deploy
  set +a
fi

: "${DEPLOY_HOST:?must be set (see .env.deploy.example)}"
: "${DEPLOY_USER:?must be set (see .env.deploy.example)}"
: "${DEPLOY_PASSWORD:?must be set (see .env.deploy.example)}"
: "${DEPLOY_PATH:?must be set (see .env.deploy.example)}"
DEPLOY_PORT="${DEPLOY_PORT:-21}"

command -v lftp >/dev/null 2>&1 || {
  echo "lftp not installed. macOS: brew install lftp / Debian: apt install lftp" >&2
  exit 1
}

echo "==> Building production bundle"
yarn build

if [ ! -f build/index.html ]; then
  echo "build/index.html missing after yarn build" >&2
  exit 1
fi

echo "==> Syncing build/ to remote via FTPS"
lftp -c "
  set ftp:ssl-force true
  set ftp:ssl-protect-data true
  set ssl:verify-certificate true
  set net:max-retries 2
  set net:timeout 15
  set cmd:fail-exit true
  open -p $DEPLOY_PORT -u \"$DEPLOY_USER\",\"$DEPLOY_PASSWORD\" ftp://$DEPLOY_HOST
  mirror --reverse --delete --verbose \\
    --exclude '^\\.well-known/' \\
    --exclude '^cgi-bin/' \\
    --exclude '^\\.htaccess\$' \\
    --exclude '^\\.ftpquota\$' \\
    build/ $DEPLOY_PATH/
"

if [ -n "${DEPLOY_VERIFY_URL:-}" ]; then
  echo "==> Verifying $DEPLOY_VERIFY_URL"
  http_code=$(curl -s -o /dev/null -w '%{http_code}' "$DEPLOY_VERIFY_URL" 2>/dev/null || true)
  : "${http_code:=000}"
  echo "HTTP $http_code"
  case "$http_code" in
    2*|3*) ;;
    *) echo "Verification failed (expected 2xx/3xx, got $http_code)" >&2; exit 1 ;;
  esac
else
  echo "==> Skipping verification (DEPLOY_VERIFY_URL not set)"
fi
