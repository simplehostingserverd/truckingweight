#!/bin/bash

# Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
#
# PROPRIETARY AND CONFIDENTIAL
#
# This file is part of the Cosmo Exploit Group LLC Weight Management System.
# Unauthorized copying of this file, via any medium is strictly prohibited.
#
# This file contains proprietary and confidential information of
# Cosmo Exploit Group LLC and may not be copied, distributed, or used
# in any way without explicit written permission.

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Simple Scale Solutions Starter   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Creating one with default values...${NC}"
  cat > .env << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w
SUPABASE_SERVICE_ROLE_KEY=

# Backend Configuration
PORT=3001
NODE_ENV=development
BACKEND_URL=http://localhost:3001

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# API Keys
MAPBOX_TOKEN=pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY21haTl1dXhpMGJ2bzJ1cTVlY2p4ajhzZCJ9.AUS7RZCMk1vnR4yQR5RAEQ
CESIUM_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YzMxZTQ1My1lODMwLTRlZTAtYmQwMC0zNzFhMzVjZjFkYWQiLCJpZCI6MTg3MzI0LCJpYXQiOjE3MDI0OTg5NTl9.U_qVSBPVJvFG5vNu7j7jgOA9jBNjqP_ZwCNIl3Xjmtw
EOL
  echo -e "${GREEN}.env file created successfully${NC}"
fi

# Run the Velociraptor port killer script
echo -e "${BLUE}Running port killer to ensure clean startup...${NC}"
node scripts/velociraptor.mjs

# Test Supabase connection
echo -e "${BLUE}Testing Supabase connection...${NC}"
node scripts/test-supabase-connection.mjs

# Start the application
echo -e "${BLUE}Starting the application...${NC}"
echo -e "${YELLOW}Note: You can use these test accounts:${NC}"
echo -e "${YELLOW}- Email: truckadmin@example.com / Password: TruckAdmin123!${NC}"
echo -e "${YELLOW}- Email: dispatcher@example.com / Password: Dispatch123!${NC}"
echo -e "${YELLOW}- Email: manager@example.com / Password: Manager123!${NC}"
echo -e "${BLUE}=======================================${NC}"

npm run dev
