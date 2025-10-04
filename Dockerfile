# Stage 1: Use Nginx to serve the Angular app
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build files to Nginx html directory
COPY dist/chat-dashboard /usr/share/nginx/html

# Copy custom nginx config if you need one (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
