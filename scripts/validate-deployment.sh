#!/bin/bash

# Checkmate App - Deployment Validation Script
# Validates that the app is ready for EAS build and App Store deployment

set -e

echo "🔍 Validating Checkmate app for EAS build deployment..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VALIDATION_PASSED=true

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
    else
        echo -e "${RED}❌ $1 missing${NC}"
        VALIDATION_PASSED=false
    fi
}

# Function to check if a directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 directory exists${NC}"
    else
        echo -e "${RED}❌ $1 directory missing${NC}"
        VALIDATION_PASSED=false
    fi
}

# Function to check if a value exists in a file
check_value_in_file() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✅ $2 found in $1${NC}"
    else
        echo -e "${RED}❌ $2 not found in $1${NC}"
        VALIDATION_PASSED=false
    fi
}

echo -e "${BLUE}📁 Checking Required Files...${NC}"
check_file "app.json"
check_file "eas.json"
check_file "package.json"
check_file ".env.production"
check_file "assets/icon.png"
check_file "assets/splash.png"

echo ""
echo -e "${BLUE}📱 Checking App Configuration...${NC}"
check_value_in_file "app.json" "com.vibecode.checkmate"
check_value_in_file "app.json" "projectId"
check_value_in_file "app.json" "NSCameraUsageDescription"

echo ""
echo -e "${BLUE}🔧 Checking EAS Configuration...${NC}"
check_value_in_file "eas.json" "production"
check_value_in_file "eas.json" "autoIncrement"
check_value_in_file "eas.json" "submit"

echo ""
echo -e "${BLUE}🔐 Checking Environment Files...${NC}"
check_file ".env.production"
check_file ".env.staging"

echo ""
echo -e "${BLUE}📦 Checking Package Dependencies...${NC}"
if [ -f "package.json" ]; then
    if grep -q "expo" package.json; then
        echo -e "${GREEN}✅ Expo SDK found${NC}"
    else
        echo -e "${RED}❌ Expo SDK not found${NC}"
        VALIDATION_PASSED=false
    fi
    
    if grep -q "react-native-plaid-link-sdk" package.json; then
        echo -e "${GREEN}✅ Plaid SDK found${NC}"
    else
        echo -e "${RED}❌ Plaid SDK not found${NC}"
        VALIDATION_PASSED=false
    fi
fi

echo ""
echo -e "${BLUE}🚀 Checking Build Scripts...${NC}"
check_file "scripts/switch-env.sh"

# Check if script is executable
if [ -x "scripts/switch-env.sh" ]; then
    echo -e "${GREEN}✅ switch-env.sh is executable${NC}"
else
    echo -e "${YELLOW}⚠️  switch-env.sh is not executable (fixing...)${NC}"
    chmod +x scripts/switch-env.sh
    echo -e "${GREEN}✅ switch-env.sh made executable${NC}"
fi

echo ""
echo "============================================"

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}🎉 VALIDATION PASSED!${NC}"
    echo -e "${GREEN}Your Checkmate app is ready for EAS build and App Store deployment!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update Apple credentials in eas.json"
    echo "2. Update Plaid production credentials in .env.production"  
    echo "3. Run: eas login"
    echo "4. Run: ./scripts/switch-env.sh production"
    echo "5. Run: eas build --profile production --platform ios"
    echo ""
else
    echo -e "${RED}❌ VALIDATION FAILED!${NC}"
    echo -e "${RED}Please fix the issues above before proceeding with deployment.${NC}"
    exit 1
fi