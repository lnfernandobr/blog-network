#!/bin/bash
# Start all services (persists across WSL sessions via setsid)
cd "$(dirname "$0")"

# Kill any existing instances
pkill -f 'tsx watch src/index.ts' 2>/dev/null
pkill -f 'next dev -p 3003' 2>/dev/null
pkill -f 'localtunnel' 2>/dev/null
sleep 1

echo "Starting API..."
setsid bash -c 'exec pnpm dev:api >> /tmp/api.log 2>&1' &
echo "API starting (logs: /tmp/api.log)"

echo "Starting social-admin..."
setsid bash -c 'exec pnpm dev:social-admin >> /tmp/social-admin.log 2>&1' &
echo "Social Admin starting (logs: /tmp/social-admin.log)"

# Start localtunnel with fixed subdomain so the verified domain stays the same
echo "Starting localtunnel (swift-rats-occur.loca.lt)..."
setsid bash -c 'exec npx localtunnel --port 4000 --subdomain swift-rats-occur >> /tmp/lt.log 2>&1' &
echo "Tunnel starting (logs: /tmp/lt.log)"

sleep 10
echo ""
echo "Services:"
curl -s http://localhost:4000/health && echo " → API OK (port 4000)"
echo " → Social Admin (port 3003)"
echo " → Public URL: https://swift-rats-occur.loca.lt"
