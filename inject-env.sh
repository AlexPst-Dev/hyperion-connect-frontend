#!/bin/sh

echo "🔧 Starting environment variable injection..."

# Variables d'environnement par défaut
API_URL=${EXPO_PUBLIC_API_URL:-"https://dev.api.hyperion-connect.com/api"}

echo "📡 Injecting API_URL: $API_URL"
echo "📁 Working directory: $(pwd)"
echo "📦 Files in html directory:"
ls -la /usr/share/nginx/html/

# Compter les fichiers JS avant traitement
JS_COUNT=$(find /usr/share/nginx/html -name "*.js" -type f | wc -l)
echo "📄 Found $JS_COUNT JavaScript files"

# Remplacer le placeholder dans tous les fichiers JS
if [ $JS_COUNT -gt 0 ]; then
    echo "🔄 Processing JavaScript files..."
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|EXPO_PUBLIC_API_URL_PLACEHOLDER|$API_URL|g" {} +
    
    # Vérifier que le remplacement a fonctionné
    REMAINING=$(find /usr/share/nginx/html -name "*.js" -type f -exec grep -l "EXPO_PUBLIC_API_URL_PLACEHOLDER" {} \; | wc -l)
    if [ $REMAINING -eq 0 ]; then
        echo "✅ All placeholders successfully replaced"
    else
        echo "⚠️ Warning: $REMAINING files still contain placeholders"
    fi
else
    echo "❌ No JavaScript files found!"
fi

echo "✅ Environment variable injection completed"