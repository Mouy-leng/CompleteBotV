#!/bin/bash

# CAPITALend AI Trading Bot - Google Cloud Deployment Script
# Usage: ./deploy-gcp.sh [PROJECT_ID] [ENVIRONMENT]

set -e

# Configuration
PROJECT_ID=${1:-"capitalend-trading-bot"}
ENVIRONMENT=${2:-"demo"}
REGION="us-central1"
SERVICE_NAME="capitalend-trading-bot"
DATABASE_INSTANCE="trading-bot-db"

echo "🚀 Deploying CAPITALend AI Trading Bot to Google Cloud"
echo "Project: $PROJECT_ID"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "📋 Setting up Google Cloud project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Create secrets for sensitive data
echo "🔐 Creating secrets..."
if [ "$ENVIRONMENT" = "live" ]; then
    echo "⚠️  LIVE ENVIRONMENT - Setting up production secrets"
    gcloud secrets create capital-api-key-live --data-file=<(echo "$CAPITAL_API_KEY_LIVE") || true
    gcloud secrets create capital-api-secret-live --data-file=<(echo "$CAPITAL_API_SECRET_LIVE") || true
    gcloud secrets create binance-api-key-live --data-file=<(echo "$BINANCE_API_KEY_LIVE") || true
    gcloud secrets create binance-api-secret-live --data-file=<(echo "$BINANCE_API_SECRET_LIVE") || true
else
    echo "🧪 DEMO ENVIRONMENT - Setting up demo secrets"
    gcloud secrets create capital-api-key-demo --data-file=<(echo "$CAPITAL_API_KEY_DEMO") || true
    gcloud secrets create capital-api-secret-demo --data-file=<(echo "$CAPITAL_API_SECRET_DEMO") || true
    gcloud secrets create binance-api-key-demo --data-file=<(echo "$BINANCE_API_KEY_DEMO") || true
    gcloud secrets create binance-api-secret-demo --data-file=<(echo "$BINANCE_API_SECRET_DEMO") || true
fi

gcloud secrets create telegram-bot-token --data-file=<(echo "$TELEGRAM_BOT_TOKEN") || true
gcloud secrets create telegram-chat-id --data-file=<(echo "$TELEGRAM_CHAT_ID") || true

# Create Cloud SQL instance (if not exists)
echo "🗄️  Setting up database..."
if ! gcloud sql instances describe $DATABASE_INSTANCE &> /dev/null; then
    echo "Creating Cloud SQL instance..."
    gcloud sql instances create $DATABASE_INSTANCE \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time=03:00 \
        --enable-autobackup \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=04
    
    # Set root password
    gcloud sql users set-password postgres \
        --instance=$DATABASE_INSTANCE \
        --password="$(openssl rand -base64 32)"
    
    # Create application database
    gcloud sql databases create trading_bot --instance=$DATABASE_INSTANCE
else
    echo "Cloud SQL instance already exists"
fi

# Build and deploy to Cloud Run
echo "🏗️  Building and deploying application..."

# Create Dockerfile optimized for Cloud Run
cat > Dockerfile.gcp << EOF
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN addgroup -g 1001 -S nodejs && adduser -S trading-bot -u 1001
RUN chown -R trading-bot:nodejs /app
USER trading-bot
EXPOSE 5000
CMD ["npm", "start"]
EOF

# Build container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 100 \
    --set-env-vars "NODE_ENV=production,TRADING_ENVIRONMENT=$ENVIRONMENT,PORT=5000" \
    --set-secrets "CAPITAL_API_KEY_${ENVIRONMENT^^}=capital-api-key-${ENVIRONMENT}:latest" \
    --set-secrets "CAPITAL_API_SECRET_${ENVIRONMENT^^}=capital-api-secret-${ENVIRONMENT}:latest" \
    --set-secrets "BINANCE_API_KEY_${ENVIRONMENT^^}=binance-api-key-${ENVIRONMENT}:latest" \
    --set-secrets "BINANCE_API_SECRET_${ENVIRONMENT^^}=binance-api-secret-${ENVIRONMENT}:latest" \
    --set-secrets "TELEGRAM_BOT_TOKEN=telegram-bot-token:latest" \
    --set-secrets "TELEGRAM_CHAT_ID=telegram-chat-id:latest"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo "📊 Dashboard: $SERVICE_URL/dashboard"

if [ "$ENVIRONMENT" = "live" ]; then
    echo ""
    echo "⚠️  IMPORTANT: LIVE TRADING ENVIRONMENT DEPLOYED"
    echo "🔴 Real money is at risk - monitor carefully"
    echo "📈 Check risk settings before enabling auto-trading"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Visit the dashboard to verify deployment"
echo "2. Check system status and broker connections"
echo "3. Test with small positions first"
echo "4. Monitor logs: gcloud run logs tail --service=$SERVICE_NAME --region=$REGION"

# Clean up
rm -f Dockerfile.gcp