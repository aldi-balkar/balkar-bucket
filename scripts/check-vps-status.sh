#!/bin/bash

echo "🔍 Checking VPS status..."
echo ""

# Check PM2 processes
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 PM2 Logs (last 50 lines):"
pm2 logs balkar-bucket-prod --lines 50 --nostream

echo ""
echo "🗄️  Database connection test:"
psql -h localhost -U balkar_admin -d balkar_bucket -c "SELECT 1;" 2>&1 || echo "❌ Database connection failed"

echo ""
echo "🌐 Port check:"
netstat -tulpn | grep :8000 || echo "❌ No process listening on port 8000"

echo ""
echo "📁 Application directory:"
ls -la ~/apps/balkar-bucket-prod/
