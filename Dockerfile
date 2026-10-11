# Build the static files
FROM node:22-alpine AS build
WORKDIR /app

# Install first: this layer is reused until the package list changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve them. This nginx image runs as a non-root user and listens on 8080
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
