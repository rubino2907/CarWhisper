# Multi-stage build for Angular app
# Stage 1: Build the Angular app
FROM node:latest AS build

WORKDIR /usr/local/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build

# Debug: List what was built
RUN ls -la /usr/local/app/dist/
RUN ls -la /usr/local/app/dist/chat-dashboard/ || echo "chat-dashboard folder not found"

# Stage 2: Serve with Nginx
FROM nginx:latest

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build files from build stage
COPY --from=build /usr/local/app/dist/chat-dashboard/ /usr/share/nginx/html/

# Debug: List what was copied
RUN ls -la /usr/share/nginx/html/

# Create nginx config for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
