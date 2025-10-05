# ChatDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Docker Deployment

### 1️⃣ Folder Structure

Assuming your project looks like this after build:

```
my-angular-app/
├── dist/
│   └── my-angular-app/
│       ├── index.html
│       ├── main.js
│       └── ...other build files
└── Dockerfile
```

### 2️⃣ Create a Dockerfile

Create a Dockerfile at your project root (next to dist/):

```dockerfile
# Stage 1: Use Nginx to serve the Angular app
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build files to Nginx html directory
COPY dist/my-angular-app /usr/share/nginx/html

# Copy custom nginx config if you need one (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Notes:**

- Replace `my-angular-app` with the actual folder name in dist/.
- You can customize nginx.conf if you need things like SPA routing (catch-all index.html).

### 3️⃣ Optional: Nginx Config for SPA

If your Angular app uses routing, add a `nginx.conf`:

```nginx
server {
    listen 80;

    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /index.html;
}
```

Then uncomment the COPY nginx.conf line in the Dockerfile.

### 4️⃣ Build Docker Image

```bash
docker build -t chat-dashboard .
```

### 5️⃣ Run the Container

```bash
docker run -d -p 80:80 --name frontend chat-dashboard
```

Now your Angular app should be accessible at http://localhost.

If you want, I can write a fully optimized multi-stage Dockerfile that builds Angular inside Docker and serves it with Nginx, so you don't need to run ng build manually every time.

## Quick Deployment Script

For convenience, here's a bash script that automates the entire deployment process:

Save this as `deploy.sh` in your project root:

```bash
#!/bin/bash
# ========================================
# Simple Deployment Script for Angular + Docker
# ========================================

# Exit on error
set -e

echo "🚀 Building Angular project..."
ng build

echo "🐳 Building Docker image: chat-dashboard"
docker build -t chat-dashboard .

echo "🧹 Removing old container (if it exists)..."
docker rm -f frontend 2>/dev/null || true

echo "🏗️ Starting new container..."
docker run -d -p 80:80 --name frontend chat-dashboard

echo "✅ Deployment complete!"
echo "🌍 Your app should be available at: http://localhost"
```

### 🔧 How to use:

1. Save the file as `deploy.sh` in your project folder.

2. Give it execute permission:

   ```bash
   chmod +x deploy_mac.sh

   chmod +x deploy_windows
   ```

3. Run it:
   ```bash
   ./deploy_mac.sh
   ou
   ./deploy_windows.bat
   ```
Just click on the file in the main folder
This script will build your Angular app, create a Docker image, and start the container in one command!
