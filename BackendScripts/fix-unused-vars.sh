#!/bin/bash

# Script to fix unused variables in the backend code
# This script comments out unused variables to fix ESLint warnings

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Fixing Unused Variables ===${NC}"

# List of files with unused variables
FILES=(
  "controllers/fastify/syncRoutes.js"
  "middleware/fastify/bearerAuth.js"
  "routes/fastify/admin.js"
  "routes/fastify/apiKeys.js"
  "routes/fastify/auth.js"
  "routes/fastify/cityAuth.js"
  "routes/fastify/cityDashboard.js"
  "routes/fastify/cityPermits.js"
  "routes/fastify/companies.js"
  "routes/fastify/drivers.js"
  "routes/fastify/examples/cacheExample.js"
  "routes/fastify/health.js"
  "routes/fastify/integrations.js"
  "routes/fastify/loads.js"
  "routes/fastify/syncRoutes.js"
  "routes/fastify/vehicles.js"
  "routes/fastify/webhooks.js"
  "routes/fastify/weights.js"
  "scripts/apply-city-schema.js"
  "server-fastify.js"
  "server.js"
  "services/cache/index.js"
  "utils/generators.js"
)

# Function to fix a file
fix_file() {
  local file=$1
  echo -e "${YELLOW}Fixing file: ${file}${NC}"

  # Create a backup
  cp "$file" "${file}.bak"

  # Fix unused variables by commenting them out
  # This is a simple approach - we'll comment out the variable declaration

  # Fix 'options' parameter in route handlers
  sed -i 's/\(function\s*(\s*\)options/\1\/\* options \*\//g' "$file"
  sed -i 's/\(async\s*function\s*(\s*\)options/\1\/\* options \*\//g' "$file"
  sed -i 's/\((\s*\)options\(\s*,\s*request\)/\1\/\* options \*\/\2/g' "$file"

  # Fix 'request' and 'reply' parameters in route handlers
  sed -i 's/\((\s*\)request\(\s*,\s*reply\)/\1\/\* request \*\/\2/g' "$file"
  sed -i 's/\(,\s*\)reply\(\s*)\)/\1\/\* reply \*\/\2/g' "$file"
  sed -i 's/\((\s*\)request\(\s*)\)/\1\/\* request \*\/\2/g' "$file"

  # Fix 'next' parameter in middleware
  sed -i 's/\(,\s*\)next\(\s*)\)/\1\/\* next \*\/\2/g' "$file"

  # Fix specific variables in specific files
  if [[ "$file" == *"bearerAuth.js" ]]; then
    sed -i 's/const cacheService/\/\/ const cacheService/g' "$file"
  fi

  if [[ "$file" == *"cityAuth.js" ]]; then
    sed -i 's/const bcrypt/\/\/ const bcrypt/g' "$file"
    sed -i 's/const { uuidv4 }/\/\/ const { uuidv4 }/g' "$file"
    sed -i 's/const logger/\/\/ const logger/g' "$file"
  fi

  if [[ "$file" == *"cityDashboard.js" ]]; then
    sed -i 's/const cityAuthMiddleware/\/\/ const cityAuthMiddleware/g' "$file"
    sed -i 's/const logger/\/\/ const logger/g' "$file"
    sed -i 's/const bearerAuthMiddleware/\/\/ const bearerAuthMiddleware/g' "$file"
    sed -i 's/\(const\s*\)activeScalesError/\1\/\* activeScalesError \*\//g' "$file"
    sed -i 's/\(const\s*\)weighingsError/\1\/\* weighingsError \*\//g' "$file"
    sed -i 's/\(const\s*\)permitRevenueError/\1\/\* permitRevenueError \*\//g' "$file"
    sed -i 's/\(const\s*\)fineRevenueError/\1\/\* fineRevenueError \*\//g' "$file"
    sed -i 's/\(const\s*\)complianceError/\1\/\* complianceError \*\//g' "$file"
    sed -i 's/\(const\s*\)pendingPermitsError/\1\/\* pendingPermitsError \*\//g' "$file"
    sed -i 's/\(const\s*\)activePermitsError/\1\/\* activePermitsError \*\//g' "$file"
    sed -i 's/\(const\s*\)recentViolationsError/\1\/\* recentViolationsError \*\//g' "$file"
  fi

  if [[ "$file" == *"cityPermits.js" ]]; then
    sed -i 's/const logger/\/\/ const logger/g' "$file"
    sed -i 's/\(const\s*\)existingPermit/\1\/\* existingPermit \*\//g' "$file"
  fi

  if [[ "$file" == *"cache/index.js" ]]; then
    sed -i 's/\(const\s*\)ttl/\1\/\* ttl \*\//g' "$file"
  fi

  if [[ "$file" == *"generators.js" ]]; then
    sed -i 's/\(,\s*\)companyId\(\s*)\)/\1\/\* companyId \*\/\2/g' "$file"
  fi

  if [[ "$file" == *"apply-city-schema.js" ]]; then
    sed -i 's/\(const\s*\)fieldName/\1\/\* fieldName \*\//g' "$file"
  fi

  if [[ "$file" == *"syncRoutes.js" ]]; then
    sed -i 's/const cacheService/\/\/ const cacheService/g' "$file"
  fi

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

echo -e "${GREEN}=== Unused Variables Fixed ===${NC}"
echo "You can now run the linting check again"
