# ---- Build: Expo web export (Node runs the Expo CLI, Bun installs) ----
FROM node:22-slim AS build
COPY --from=oven/bun:1.4 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# No EXPO_PUBLIC_API_URL here on purpose: the placeholder is replaced at startup.
RUN bun x expo export --platform web

# ---- Runtime: static files served by nginx ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY inject-env.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh
EXPOSE 80
