#!/bin/bash

# Script to fix TypeScript syntax errors in the backend code
# This script fixes common patterns of errors in TypeScript files

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Fixing TypeScript Syntax Errors ===${NC}"

# Function to fix a file
fix_file() {
  local file=$1
  echo -e "${YELLOW}Fixing file: ${file}${NC}"

  # Create a backup
  cp "$file" "${file}.bak"

  # Fix arrow function syntax in Promise return types
  sed -i 's/): Promise<[^>]*> => {/): Promise<&> {/g' "$file"

  # Fix specific patterns in erp files
  if [[ "$file" == *"services/erp"* ]]; then
    sed -i 's/async fetchCustomers(): Promise<): Promise<): ): ): Promise<ErpData[]> => { {> { {> {/async fetchCustomers(): Promise<ErpData[]> {/g' "$file"
    sed -i 's/async fetchInvoices(customerId?: string): Promise<): Promise<): ): ): Promise<ErpData[]> => { {> { {> {/async fetchInvoices(customerId?: string): Promise<ErpData[]> {/g' "$file"
    sed -i 's/async createInvoice(invoiceData: any): Promise<): Promise<): ): ): Promise<ErpData> => { {> { {> {/async createInvoice(invoiceData: any): Promise<ErpData> {/g' "$file"
    sed -i 's/async syncWeighTicket(ticketId: string, ticketData: any): Promise<): Promise<): ): ): Promise<ErpData> => { {> { {> {/async syncWeighTicket(ticketId: string, ticketData: any): Promise<ErpData> {/g' "$file"
    sed -i 's/private async logErpEvent([^)]*): Promise<): Promise<): ): ): Promise<void> => { {> { {> {/private async logErpEvent\1: Promise<void> {/g' "$file"
    sed -i 's/private async callApi([^)]*): Promise<): Promise<): ): ): Promise<any> => { {> { {> {/private async callApi\1: Promise<any> {/g' "$file"
  fi

  # Fix specific issues in services/cache/index.ts
  if [[ "$file" == *"services/cache/index.ts" ]]; then
    sed -i 's/public async get<T>(key: string): Promise<): Promise<): ): ): Promise<T | null> => { {> { {> {/public async get<T>(key: string): Promise<T | null> {/g' "$file"
    sed -i 's/public async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<): Promise<): ): ): Promise<boolean> => { {> { {> {/public async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<boolean> {/g' "$file"
    sed -i 's/public async delete(key: string): Promise<): Promise<): ): ): Promise<boolean> => { {> { {> {/public async delete(key: string): Promise<boolean> {/g' "$file"
    sed -i 's/public async clear(): Promise<): Promise<): ): ): Promise<boolean> => { {> { {> {/public async clear(): Promise<boolean> {/g' "$file"
    sed -i 's/private lruCache: ReturnType<typeof lru>;/private lruCache: ReturnType<typeof lru>/g' "$file"
    sed -i 's/private readonly defaultTTL: number = 3600;/private readonly defaultTTL: number = 3600/g' "$file"
  fi

  # Fix interface declarations
  sed -i 's/interface interface/interface/g' "$file"

  # Fix trailing semicolons in TypeScript files
  if [[ "$file" == *".ts" ]]; then
    sed -i 's/;$//' "$file"
  fi

  # Fix specific issues in services/telematics/samsara.ts
  if [[ "$file" == *"services/telematics/samsara.ts" ]]; then
    sed -i 's/class SamsaraService implements TelematicsProvider {/class SamsaraService implements TelematicsProvider {/g' "$file"
  fi

  # Fix specific issues in services/qrCodeService.ts and weighTicketService.ts
  if [[ "$file" == *"qrCodeService.ts" ]]; then
    sed -i 's/export const generateQRCode/export function generateQRCode/g' "$file"
  fi

  if [[ "$file" == *"weighTicketService.ts" ]]; then
    sed -i 's/export const generateWeighTicket/export function generateWeighTicket/g' "$file"
  fi

  # Fix comma issues in JS files
  if [[ "$file" == *".js" ]]; then
    sed -i 's/,\s*)/)/g' "$file"
    sed -i 's/,\s*}/}/g' "$file"
  fi

  echo -e "${GREEN}✅ Fixed: ${file}${NC}"
}

# List of files with TypeScript errors
FILES=(
  "config/prisma.ts"
  "controllers/apiKeys.ts"
  "controllers/dashboard.ts"
  "controllers/fastify/syncRoutes.js"
  "controllers/integrations.ts"
  "controllers/prisma-example.ts"
  "controllers/scaleController.ts"
  "controllers/webhooks.ts"
  "controllers/weighTicketController.ts"
  "middleware/auth.ts"
  "middleware/companyContext.ts"
  "middleware/fastify/bearerAuth.js"
  "routes/fastify/cityAuth.js"
  "routes/fastify/cityDashboard.js"
  "routes/fastify/cityPermits.js"
  "routes/fastify/health.js"
  "server-fastify.js"
  "server.ts"
  "services/cache/index.js"
  "services/cache/index.ts"
  "services/erp/index.ts"
  "services/erp/netsuite.ts"
  "services/erp/sap.ts"
  "services/qrCodeService.ts"
  "services/scaleIntegration.ts"
  "services/telematics/geotab.ts"
  "services/telematics/index.ts"
  "services/telematics/samsara.ts"
  "services/weighTicketService.ts"
  "utils/compliance.ts"
  "utils/logger.ts"
)

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    fix_file "$file"
  else
    echo -e "${RED}File not found: ${file}${NC}"
  fi
done

echo -e "${GREEN}=== TypeScript Syntax Errors Fixed ===${NC}"
echo "You can now run the linting check again"
