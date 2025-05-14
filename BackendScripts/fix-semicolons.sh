#!/bin/bash

# Script to remove trailing semicolons from TypeScript files
# This fixes the syntax errors in the codebase

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Fixing TypeScript Syntax Errors ===${NC}"
echo "This script will remove trailing semicolons from TypeScript files"

# List of files to fix
FILES=(
  "./backend/utils/compliance.ts"
  "./backend/routes/fastify/examples/cacheExample.ts"
  "./backend/services/cache/index.ts"
  "./backend/services/erp/index.ts"
  "./backend/services/erp/netsuite.ts"
  "./backend/services/erp/sap.ts"
  "./backend/services/qrCodeService.ts"
  "./backend/services/scaleIntegration.ts"
  "./backend/services/telematics/geotab.ts"
  "./backend/services/telematics/index.ts"
  "./backend/services/telematics/samsara.ts"
  "./backend/services/weighTicketService.ts"
)

# Function to fix a file
fix_file() {
  local file=$1
  echo -e "${YELLOW}Fixing file: ${file}${NC}"
  
  # Create a backup
  cp "$file" "${file}.bak"
  
  # Remove trailing semicolons from lines
  sed -i 's/;$//' "$file"
  
  # Remove semicolons before closing braces
  sed -i 's/;}/}/' "$file"
  
  # Remove semicolons before opening braces
  sed -i 's/;{/{/' "$file"
  
  # Remove semicolons at the end of comment lines
  sed -i 's/\*;$/\*/' "$file"
  sed -i 's/\/\/.*\;$/\/\//' "$file"
  
  # Fix specific syntax issues
  sed -i 's/interface.*{;/interface \1{/' "$file"
  sed -i 's/const.*=.*{;/const \1= {/' "$file"
  sed -i 's/export const.*=.*{;/export const \1= {/' "$file"
  sed -i 's/export interface.*{;/export interface \1{/' "$file"
  
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
