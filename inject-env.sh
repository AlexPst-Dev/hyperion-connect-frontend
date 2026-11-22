#!/bin/sh
# Runs before nginx starts (official image: /docker-entrypoint.d/).
# Writes the API address into the web bundle built with a placeholder.
set -e

if [ -z "$EXPO_PUBLIC_API_URL" ]; then
  echo "EXPO_PUBLIC_API_URL is not set: the app cannot reach its API" >&2
  exit 1
fi

find /usr/share/nginx/html -name "*.js" -type f \
  -exec sed -i "s|EXPO_PUBLIC_API_URL_PLACEHOLDER|$EXPO_PUBLIC_API_URL|g" {} +
echo "API URL set to $EXPO_PUBLIC_API_URL"
