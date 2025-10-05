@echo off
REM ========================================
REM Simple Deployment Script for Angular + Docker (Windows)
REM ========================================

REM Stop on errors
setlocal enabledelayedexpansion

echo.
echo 🧠 Checking Conda installation...

where conda >nul 2>&1
if errorlevel 1 (
    echo ❌ Conda not found. Please install Anaconda/Miniconda first.
    pause
    exit /b 1
)

REM --- Activate Conda environment ---
echo.
echo 🐍 Activating Conda environment 'frontend'...
call "%USERPROFILE%\anaconda3\Scripts\activate.bat" frontend
if errorlevel 1 (
    echo ❌ Failed to activate Conda environment 'frontend'.
    echo Make sure you ran "conda init cmd" and restarted the shell.
    pause
    exit /b 1
)

REM --- Check Angular CLI ---
echo.
echo 🔍 Checking Angular CLI...
where ng >nul 2>&1
if errorlevel 1 (
    echo ❌ Angular CLI 'ng' not found in 'frontend' environment.
    echo Run: npm install -g @angular/cli
    pause
    exit /b 1
)

REM --- Build Angular project ---
echo.
echo 🚀 Building Angular project...
call ng build
if errorlevel 1 (
    echo ❌ Angular build failed.
    pause
    exit /b 1
)

REM --- Build Docker image ---
echo.
echo 🐳 Building Docker image: chat-dashboard...
docker build -t chat-dashboard .
if errorlevel 1 (
    echo ❌ Docker build failed.
    pause
    exit /b 1
)

REM --- Remove old container ---
echo.
echo 🧹 Removing old container (if it exists)...
docker rm -f frontend >nul 2>&1

REM --- Run new container ---
echo.
echo 🏗️ Starting new container...
docker run -d -p 80:80 --name frontend chat-dashboard
if errorlevel 1 (
    echo ❌ Failed to start Docker container.
    pause
    exit /b 1
)

echo.
echo ✅ Deployment complete!
echo 🌍 Your app should be available at: http://localhost
echo.
pause
