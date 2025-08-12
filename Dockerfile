# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers de config d'abord
COPY package*.json ./
COPY app.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du projet
COPY . .

# Build Expo Web avec Metro → dossier dist/
RUN npm run build:web

# ---- Runtime stage ----
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copier le build web
COPY --from=builder /app/dist/ ./

# Copier la config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le script d’injection d’env
COPY inject-env.sh /docker-entrypoint.d/00-inject-env.sh
RUN chmod +x /docker-entrypoint.d/00-inject-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
