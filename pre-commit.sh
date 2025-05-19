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
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running pre-commit checks...${NC}"

# Check if we're in the root directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: This script must be run from the root directory of the project.${NC}"
  exit 1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if npm is installed
if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed.${NC}"
  exit 1
fi

# Check for staged files
echo -e "${YELLOW}Checking for staged files...${NC}"
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo -e "${YELLOW}No JavaScript/TypeScript files staged for commit.${NC}"
  echo -e "${GREEN}Pre-commit checks passed!${NC}"
  exit 0
fi

# Run frontend checks
echo -e "${YELLOW}Running frontend checks...${NC}"
cd frontend || { echo -e "${RED}Error: frontend directory not found.${NC}"; exit 1; }

echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint || { echo -e "${RED}ESLint failed. Please fix the errors and try again.${NC}"; exit 1; }

echo -e "${YELLOW}Running TypeScript type check...${NC}"
npm run typecheck || { echo -e "${RED}TypeScript type check failed. Please fix the errors and try again.${NC}"; exit 1; }

echo -e "${YELLOW}Running Prettier...${NC}"
npm run format:check || { echo -e "${RED}Prettier check failed. Run 'npm run format:fix' to fix formatting issues.${NC}"; exit 1; }

# Return to root directory
cd ..

# Run backend checks
echo -e "${YELLOW}Running backend checks...${NC}"
cd backend || { echo -e "${RED}Error: backend directory not found.${NC}"; exit 1; }

echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint || { echo -e "${YELLOW}ESLint found issues in backend. Consider fixing them.${NC}"; }

echo -e "${YELLOW}Running TypeScript type check...${NC}"
npm run typecheck || { echo -e "${YELLOW}TypeScript type check found issues in backend. Consider fixing them.${NC}"; }

# Return to root directory
cd ..

echo -e "${GREEN}All pre-commit checks passed!${NC}"
echo -e "${BLUE}You can now commit your changes.${NC}"
exit 0
