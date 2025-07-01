#!/bin/bash

# Environment switching script for Checkmate app
# Usage: ./scripts/switch-env.sh [production|staging|development]

set -e

ENVIRONMENT=${1:-development}
ENV_FILE=".env"

echo "🔄 Switching to $ENVIRONMENT environment..."

case $ENVIRONMENT in
  production)
    if [ -f ".env.production" ]; then
      cp .env.production $ENV_FILE
      echo "✅ Switched to production environment"
      echo "⚠️  Make sure to update Plaid credentials in .env.production before building!"
    else
      echo "❌ .env.production file not found"
      exit 1
    fi
    ;;
  staging)
    if [ -f ".env.staging" ]; then
      cp .env.staging $ENV_FILE
      echo "✅ Switched to staging environment"
    else
      echo "❌ .env.staging file not found"
      exit 1
    fi
    ;;
  development)
    echo "✅ Using default development environment"
    echo "ℹ️  App will run in demo mode without Plaid credentials"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [production|staging|development]"
    exit 1
    ;;
esac

echo ""
echo "📋 Current environment settings:"
if [ -f "$ENV_FILE" ]; then
  grep "EXPO_PUBLIC_PLAID_ENVIRONMENT\|EXPO_PUBLIC_APP_ENV" $ENV_FILE || echo "No environment variables found"
else
  echo "No .env file found - using default settings"
fi

echo ""
echo "🚀 Ready to build! Use:"
echo "  eas build --profile $ENVIRONMENT --platform ios"
echo "  eas build --profile $ENVIRONMENT --platform android"