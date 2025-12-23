#!/bin/bash

echo "========================================="
echo "🔍 VPS Debug Information"
echo "========================================="
echo ""

echo "1️⃣  Application Directory:"
ls -la ~/apps/balkar-bucket-prod/ 2>&1 || echo "❌ Directory not found"
echo ""

echo "2️⃣  .env File:"
cat ~/apps/balkar-bucket-prod/.env 2>&1 || echo "❌ .env not found"
echo ""

echo "3️⃣  Dist Directory:"
ls -la ~/apps/balkar-bucket-prod/dist/ 2>&1 || echo "❌ dist/ not found"
echo ""

echo "4️⃣  PM2 Process List:"
pm2 list
echo ""

echo "5️⃣  PM2 Logs (last 30 lines):"
pm2 logs balkar-bucket-prod --lines 30 --nostream 2>&1 || echo "❌ No logs found"
echo ""

echo "6️⃣  Database Connection Test:"
PGPASSWORD='Buana200897!' psql -h localhost -U balkar_admin -d balkar_bucket -c "SELECT version();" 2>&1 || echo "❌ DB connection failed"
echo ""

echo "7️⃣  Ports in Use:"
netstat -tulpn | grep -E ':(8000|8001|8002)' || echo "❌ No app ports in use"
echo ""

echo "8️⃣  Try Manual Start:"
cd ~/apps/balkar-bucket-prod && NODE_ENV=production node dist/server.js &
sleep 3
curl -s http://localhost:8000/api/health || echo "❌ Manual start failed"
pkill -f "node dist/server.js"
