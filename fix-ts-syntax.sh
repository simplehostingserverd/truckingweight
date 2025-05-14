#!/bin/bash

# Script to fix TypeScript syntax errors in the backend files
# This script removes trailing semicolons and fixes other syntax issues

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Fixing TypeScript Syntax Errors ===${NC}"

# List of files to fix
FILES=(
  "backend/utils/compliance.ts"
  "backend/routes/fastify/examples/cacheExample.ts"
  "backend/services/cache/index.ts"
  "backend/services/erp/index.ts"
  "backend/services/erp/netsuite.ts"
  "backend/services/erp/sap.ts"
  "backend/services/qrCodeService.ts"
  "backend/services/scaleIntegration.ts"
  "backend/services/telematics/geotab.ts"
  "backend/services/telematics/index.ts"
  "backend/services/telematics/samsara.ts"
  "backend/services/weighTicketService.ts"
)

# Function to fix a file
fix_file() {
  local file=$1
  echo -e "${YELLOW}Fixing file: ${file}${NC}"
  
  # Create a backup
  cp "$file" "${file}.bak"
  
  # Fix interface declarations
  sed -i 's/interface [A-Za-z0-9_]*\s*{;/interface &/' "$file"
  sed -i 's/{;/{/' "$file"
  
  # Fix export interface declarations
  sed -i 's/export interface [A-Za-z0-9_]*\s*{;/export interface &/' "$file"
  
  # Fix const declarations
  sed -i 's/const [A-Za-z0-9_]*\s*=\s*{;/const &/' "$file"
  sed -i 's/export const [A-Za-z0-9_]*\s*=\s*{;/export const &/' "$file"
  
  # Fix function declarations
  sed -i 's/export const [A-Za-z0-9_]*\s*=\s*async\s*(;/export const &/' "$file"
  
  # Fix return statements
  sed -i 's/return {;/return {/' "$file"
  
  # Remove trailing semicolons from lines
  sed -i 's/;$//' "$file"
  
  # Remove semicolons before closing braces
  sed -i 's/;}/}/' "$file"
  
  # Remove semicolons before opening braces
  sed -i 's/;{/{/' "$file"
  
  # Remove semicolons at the end of comment lines
  sed -i 's/\*;$/\*/' "$file"
  sed -i 's/\/\/.*\;$/\/\//' "$file"
  
  echo -e "${GREEN}✅ Fixed: ${file}${NC}"
}

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    fix_file "$file"
  else
    echo -e "${RED}File not found: ${file}${NC}"
  fi
done

echo -e "${GREEN}=== TypeScript Syntax Errors Fixed ===${NC}"
echo "You can now run the linting and formatting checks again"
