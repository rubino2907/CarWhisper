#!/bin/bash
# ========================================
# Deploy Angular + Docker (Git Bash / macOS / Linux / WSL)
# ========================================

set -u  # Treat unset variables as an error

# --- Colors ---
GREEN='\033[1;32m'
RED='\033[1;31m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

# --- Error handling ---
handle_error() {
    echo -e "${RED}❌ Error occurred on line $1${NC}"
    read -p "Press ENTER to close..."
    exit 1
}
trap 'handle_error $LINENO' ERR

echo -e "${CYAN}🔍 Listing Conda environments...${NC}"
conda env list || true
echo

# --- Activate frontend environment ---
echo -e "${YELLOW}🐍 Activating Conda environment 'frontend'...${NC}"
CONDA_PREFIX=$(conda info --base)
"$CONDA_PREFIX"/condabin/conda activate frontend || {
    echo -e "${RED}❌ Failed to activate Conda environment 'frontend'.${NC}"
    echo "👉 Make sure you ran 'conda init bash' and restarted Git Bash."
    read -p "Press ENTER to close..."
    exit 1
}

# --- Check Angular CLI ---
if ! "$CONDA_PREFIX"/condabin/conda run -n frontend ng version >/dev/null 2>&1; then
    echo -e "${YELLOW}⚡ Angular CLI not found in 'frontend', installing...${NC}"
    "$CONDA_PREFIX"/condabin/conda run -n frontend npm install -g @angular/cli || {
        echo -e "${RED}❌ Failed to install Angular CLI.${NC}"
        read -p "Press ENTER to close..."
        exit 1
    }
fi

# --- Build Angular project ---
echo -e "${CYAN}🚀 Building Angular project...${NC}"
"$CONDA_PREFIX"/condabin/conda run -n frontend ng build --configuration production || {
    echo -e "${RED}❌ Angular build failed.${NC}"
    read -p "Press ENTER to close..."
    exit 1
}

# --- Build Docker image ---
echo -e "${CYAN}🐳 Building Docker image: chat-dashboard...${NC}"
docker build -t chat-dashboard . || {
    echo -e "${RED}❌ Docker build failed.${NC}"
    read -p "Press ENTER to close..."
    exit 1
}

# --- Remove old container ---
echo -e "${YELLOW}🧹 Removing old container (if it exists)...${NC}"
docker rm -f frontend >/dev/null 2>&1 || true

# --- Run new container ---
echo -e "${CYAN}🏗️ Starting new container...${NC}"
docker run -d -p 80:80 --name frontend chat-dashboard || {
    echo -e "${RED}❌ Failed to start Docker container.${NC}"
    read -p "Press ENTER to close..."
    exit 1
}

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "🌍 Your app should be available at: http://localhost"
read -p "Press ENTER to exit..."
