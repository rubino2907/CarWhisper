# Multi-stage build for Angular app
# Stage 1: Build the Angular app
FROM node:latest AS build

WORKDIR /usr/local/app

# Copy package files
COPY ./ /usr/local/app/

# Install dependencies
RUN npm install

# Copy source code
RUN npm run build 


#serve app with nginx 


# Stage 2: Serve with Nginx
FROM nginx:latest

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build files from build stage
COPY --from=build /usr/local/app/dist/chat-dashboard /usr/share/nginx/html/
# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
