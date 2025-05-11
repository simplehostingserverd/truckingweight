#!/bin/bash

# Script to fix TypeScript arrow function syntax errors in service files
# This script replaces ): Promise<...> => { with ): Promise<...> {

# ANSI color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

# Function to print formatted messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${BOLD}${message}${RESET}"
}

# Function to fix a file
fix_file() {
  local file=$1
  local backup_file="${file}.bak"
  
  print_message "${BLUE}" "Fixing file: ${file}"
  
  # Create a backup
  cp "$file" "$backup_file"
  
  # Fix the arrow function syntax errors
  # This replaces ): Promise<...> => { with ): Promise<...> {
  sed -i 's/): Promise<[^>]*> => {/): Promise<\1> {/g' "$file"
  
  # Fix other common patterns
  sed -i 's/): Promise<[^>]*>[ ]*=>[ ]*{/): Promise<\1> {/g' "$file"
  sed -i 's/): Promise<void> => {/): Promise<void> {/g' "$file"
  sed -i 's/): Promise<boolean> => {/): Promise<boolean> {/g' "$file"
  sed -i 's/): Promise<string> => {/): Promise<string> {/g' "$file"
  sed -i 's/): Promise<number> => {/): Promise<number> {/g' "$file"
  sed -i 's/): Promise<any> => {/): Promise<any> {/g' "$file"
  sed -i 's/): Promise<any\[\]> => {/): Promise<any[]> {/g' "$file"
  sed -i 's/): Promise<string\[\]> => {/): Promise<string[]> {/g' "$file"
  sed -i 's/): Promise<Record<string, [^>]*>> => {/): Promise<Record<string, \1>> {/g' "$file"
  
  # Count the number of remaining errors
  local remaining_errors=$(grep -c " => {" "$file" || echo "0")
  
  if [ "$remaining_errors" -gt 0 ]; then
    print_message "${YELLOW}" "  - $remaining_errors potential issues remaining, manual review needed"
  else
    print_message "${GREEN}" "  - File fixed successfully"
  fi
}

# Main function
main() {
  print_message "${BLUE}" "Starting TypeScript syntax error fix script"
  
  # List of files to fix
  files=(
    "backend/services/erp/index.ts"
    "backend/services/erp/netsuite.ts"
    "backend/services/erp/sap.ts"
    "backend/services/redis/index.ts"
    "backend/services/scaleIntegration.ts"
    "backend/services/telematics/geotab.ts"
    "backend/services/telematics/index.ts"
    "backend/services/telematics/samsara.ts"
    "backend/utils/compliance.ts"
  )
  
  # Fix each file
  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      fix_file "$file"
    else
      print_message "${RED}" "File not found: $file"
    fi
  done
  
  print_message "${GREEN}" "TypeScript syntax error fix script completed"
  print_message "${YELLOW}" "Please review the changes and run TypeScript checks again"
}

# Run the main function
main
