#!/bin/sh
echo "🔧 Injecting environment variables..."

API_URL=${EXPO_PUBLIC_API_URL:-"https://dev.api.hyperion-connect.com/api"}
echo "📡 API_URL: $API_URL"

find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|EXPO_PUBLIC_API_URL_PLACEHOLDER|$API_URL|g" {} +

echo "✅ Environment variables injected successfully"
