#!/bin/bash
echo "🧪 Testing StagifyAI Deployment..."
echo ""

# Test the main application
echo "📱 Testing main application..."
curl -s -o /dev/null -w "%{http_code}" https://stagifyai.pages.dev
if [ $? -eq 0 ]; then
    echo "✅ Main site is responding"
else
    echo "❌ Main site is not responding"
fi

# Test API endpoints
echo ""
echo "🔍 Testing API endpoints..."

echo "Testing health endpoint..."
curl -s -o /dev/null -w "%{http_code}" https://stagifyai.pages.dev/api/health
echo " - Health check"

echo "Testing staging endpoint..."
curl -s -o /dev/null -w "%{http_code}" https://stagifyai.pages.dev/api/stage
echo " - Staging API"

echo ""
echo "🎯 Key URLs:"
echo "Main site: https://stagifyai.pages.dev"
echo "Custom domain: https://stagifyai.com"
echo "GitHub repo: https://github.com/czarkazmx1x/stagifyai-saas"
echo ""
echo "✅ Deployment verification complete!"
