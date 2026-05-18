#!/bin/bash
# Start the API (persists across WSL sessions via setsid)
cd "$(dirname "$0")"

# Kill any existing instance
pkill -f 'node --watch src/index.js' 2>/dev/null
pkill -f 'node src/index.js' 2>/dev/null
sleep 1

echo "Starting API..."
setsid bash -c 'exec pnpm dev >> /tmp/api.log 2>&1' &
echo "API starting (logs: /tmp/api.log)"

sleep 5
echo ""
curl -s http://localhost:4000/health && echo " → API OK (port 4000)"
