#!/usr/bin/env bash
# Deploy step that runs ON the VPS. Assumes the working tree at $APP_DIR is
# already at the desired commit (the caller does the git sync). Self-healing:
# any PM2 app that isn't us — stale name, leftover from earlier deploys — gets
# deleted before we (re)start. The smoke test then asserts the response on the
# port actually identifies as our package.json name + version, so a zombie
# holding the port causes a hard failure instead of a silent success.

set -euo pipefail

APP_NAME="${APP_NAME:-fernandolimaindie-api}"
APP_DIR="${APP_DIR:-/opt/fernandolimaindie}"
PORT="${PORT:-4000}"
HEALTH_RETRIES="${HEALTH_RETRIES:-8}"

cd "$APP_DIR"

echo "→ Installing dependencies (api only)"
pnpm install --filter @fernandolimaindie/api... --frozen-lockfile

echo "→ Reaping foreign PM2 apps (anything other than ${APP_NAME})"
STALE=$(pm2 jlist | APP_NAME="$APP_NAME" node -e '
  let s = ""; process.stdin.on("data", d => s += d);
  process.stdin.on("end", () => {
    try {
      for (const a of JSON.parse(s)) {
        if (a.name !== process.env.APP_NAME) console.log(a.name);
      }
    } catch { /* empty pm2 list */ }
  });
')
if [ -n "$STALE" ]; then
  echo "$STALE" | while read -r name; do
    [ -z "$name" ] && continue
    echo "  - deleting $name"
    pm2 delete "$name" || true
  done
else
  echo "  (none)"
fi

echo "→ Starting or reloading ${APP_NAME}"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start apps/api/ecosystem.config.cjs
fi
pm2 save >/dev/null

echo "→ Smoke test on :${PORT}/health"
RESPONSE=""
for i in $(seq 1 "$HEALTH_RETRIES"); do
  sleep 2
  if RESPONSE=$(curl -fsS "http://localhost:${PORT}/health" 2>/dev/null); then
    break
  fi
  echo "  retry ${i}/${HEALTH_RETRIES}..."
done

if [ -z "$RESPONSE" ]; then
  echo "✗ /health never responded after ${HEALTH_RETRIES} retries"
  pm2 logs "$APP_NAME" --lines 40 --nostream || true
  exit 1
fi

echo "  response: $RESPONSE"

RESPONSE="$RESPONSE" PORT="$PORT" node -e '
  let got;
  try { got = JSON.parse(process.env.RESPONSE); }
  catch (e) {
    console.error(`✗ /health did not return JSON: ${process.env.RESPONSE}`);
    process.exit(1);
  }
  const expected = require("./apps/api/package.json");
  if (got.name !== expected.name || got.version !== expected.version) {
    console.error(`✗ Wrong app on :${process.env.PORT} — got ${got.name} v${got.version}, expected ${expected.name} v${expected.version}. Likely a stale process holding the port.`);
    process.exit(1);
  }
  console.log(`✓ Correct app serving: ${got.name} v${got.version}`);
'

echo "✓ Deploy completed at $(date -u +%FT%TZ)"
