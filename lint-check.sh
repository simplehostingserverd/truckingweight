#!/bin/bash

# Comprehensive linting script for TruckingSemis project
# This script runs ESLint, Prettier, and TypeScript type checking on the codebase

# ANSI color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Function to print formatted messages
print_message() {
  local color=$1
  local emoji=$2
  local message=$3
  echo -e "${color}${BOLD}${emoji} ${message}${RESET}"
}

# Function to handle errors
handle_error() {
  print_message "${RED}" "❌" "$1"
  exit 1
}

# Function to print section headers
print_header() {
  local message=$1
  echo ""
  echo -e "${CYAN}${BOLD}=== $message ===${RESET}"
  echo ""
}

# Check if running in toolbox
check_toolbox() {
  if [ -f /run/.toolboxenv ]; then
    print_message "${GREEN}" "✅" "Running in toolbox environment"
  else
    print_message "${YELLOW}" "⚠️" "This script should ideally be run inside a toolbox environment"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      handle_error "Please run 'toolbox enter' first, then run this script again"
    fi
  fi
}

# Check if npm is available
check_npm() {
  if ! command -v npm &> /dev/null; then
    handle_error "npm is not installed. Please install Node.js and npm first"
  fi
  print_message "${GREEN}" "✅" "npm is available"
}

# Run ESLint on frontend
lint_frontend() {
  print_header "Linting Frontend Code"

  if [ ! -d "frontend" ]; then
    handle_error "Frontend directory not found!"
  fi

  cd frontend || handle_error "Could not change to frontend directory"
  print_message "${BLUE}" "🔍" "Running ESLint on frontend..."

  # Run ESLint with specific configuration to avoid conflicts
  if npx eslint --config .eslintrc.json .; then
    print_message "${GREEN}" "✅" "Frontend linting passed"
  else
    local exit_code=$?
    print_message "${YELLOW}" "⚠️" "Frontend linting had issues"

    # Ask if user wants to continue despite linting errors
    read -p "Continue with other checks? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      cd ..
      exit $exit_code
    fi
  fi

  cd ..
}

# Run ESLint on backend
lint_backend() {
  print_header "Linting Backend Code"

  if [ ! -d "backend" ]; then
    print_message "${YELLOW}" "⚠️" "Backend directory not found, skipping backend linting"
    return
  fi

  cd backend || handle_error "Could not change to backend directory"

  # Create a temporary ESLint config if one doesn't exist
  if [ ! -f ".eslintrc.json" ]; then
    print_message "${BLUE}" "📝" "Creating temporary ESLint config for backend..."
    cat > .eslintrc.temp.json << EOF
{
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": "warn",
    "semi": ["error", "always"]
  }
}
EOF
    TEMP_CONFIG="--config .eslintrc.temp.json"
  else
    TEMP_CONFIG=""
  fi

  print_message "${BLUE}" "🔍" "Running ESLint on backend..."
  if npx eslint ${TEMP_CONFIG} . --ext .js,.ts; then
    print_message "${GREEN}" "✅" "Backend linting passed"
  else
    local exit_code=$?
    print_message "${YELLOW}" "⚠️" "Backend linting had issues"

    # Ask if user wants to continue despite linting errors
    read -p "Continue with other checks? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      # Clean up temporary config if it exists
      [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json
      cd ..
      exit $exit_code
    fi
  fi

  # Clean up temporary config if it exists
  [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json

  cd ..
}

# Run Prettier check
check_formatting() {
  print_header "Checking Code Formatting"

  print_message "${BLUE}" "🔍" "Running Prettier check..."
  if npm run format:check; then
    print_message "${GREEN}" "✅" "Code formatting check passed"
  else
    print_message "${YELLOW}" "⚠️" "Code formatting issues found"
    read -p "Would you like to automatically fix formatting issues? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      print_message "${BLUE}" "🔧" "Fixing formatting issues..."
      npm run format
      print_message "${GREEN}" "✅" "Formatting issues fixed"
    else
      print_message "${YELLOW}" "⚠️" "Formatting issues not fixed"
    fi
  fi
}

# Run TypeScript type checking
check_types() {
  print_header "TypeScript Type Checking"

  # Check frontend types
  if [ -d "frontend" ]; then
    cd frontend || handle_error "Could not change to frontend directory"
    print_message "${BLUE}" "🔍" "Running TypeScript type checking on frontend..."

    if npx tsc --noEmit; then
      print_message "${GREEN}" "✅" "Frontend type checking passed"
    else
      print_message "${RED}" "❌" "Frontend type checking failed"
      cd ..
      exit 1
    fi

    cd ..
  fi

  # Check backend types if it uses TypeScript
  if [ -d "backend" ] && [ -f "backend/tsconfig.json" ]; then
    cd backend || handle_error "Could not change to backend directory"
    print_message "${BLUE}" "🔍" "Running TypeScript type checking on backend..."

    if npx tsc --noEmit; then
      print_message "${GREEN}" "✅" "Backend type checking passed"
    else
      print_message "${RED}" "❌" "Backend type checking failed"
      cd ..
      exit 1
    fi

    cd ..
  elif [ -d "backend" ]; then
    print_message "${YELLOW}" "⚠️" "Backend TypeScript configuration not found, skipping type checking"
  fi
}

# Run tests
run_tests() {
  print_header "Running Tests"

  read -p "Would you like to run tests? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_message "${YELLOW}" "⚠️" "Skipping tests"
    return
  fi

  # Run frontend tests
  if [ -d "frontend" ]; then
    cd frontend || handle_error "Could not change to frontend directory"
    print_message "${BLUE}" "🧪" "Running frontend tests..."

    npm test || print_message "${YELLOW}" "⚠️" "Frontend tests failed or not available"

    cd ..
  fi

  # Run backend tests
  if [ -d "backend" ]; then
    cd backend || handle_error "Could not change to backend directory"
    print_message "${BLUE}" "🧪" "Running backend tests..."

    npm test || print_message "${YELLOW}" "⚠️" "Backend tests failed or not available"

    cd ..
  fi
}

# Check for and fix ESLint configuration conflicts
check_eslint_config() {
  print_header "Checking ESLint Configuration"

  # Check if there are potential conflicts between root and frontend ESLint configs
  if [ -f ".eslintrc.json" ] && [ -f "frontend/.eslintrc.json" ]; then
    print_message "${BLUE}" "🔍" "Checking for ESLint configuration conflicts..."

    # Check if root config has Next.js rules that might conflict with frontend
    if grep -q "next/core-web-vitals" .eslintrc.json; then
      print_message "${YELLOW}" "⚠️" "Potential ESLint configuration conflict detected"
      print_message "${YELLOW}" "ℹ️" "The root .eslintrc.json contains Next.js rules that might conflict with frontend/.eslintrc.json"

      read -p "Would you like to update the root config to avoid conflicts? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "${BLUE}" "🔧" "Updating root ESLint configuration..."

        # Add ignorePatterns for frontend to root config if not already present
        if ! grep -q "ignorePatterns" .eslintrc.json; then
          # Use sed to add ignorePatterns before the last closing brace
          sed -i '$ s/}$/,\n  "ignorePatterns": ["frontend\/**\/*"]\n}/' .eslintrc.json
          print_message "${GREEN}" "✅" "Added frontend to ignorePatterns in root ESLint config"
        elif ! grep -q "frontend/" .eslintrc.json; then
          # If ignorePatterns exists but doesn't include frontend, add it
          sed -i 's/"ignorePatterns": \[/"ignorePatterns": \["frontend\/**\/*", /g' .eslintrc.json
          print_message "${GREEN}" "✅" "Added frontend to existing ignorePatterns in root ESLint config"
        fi

        print_message "${GREEN}" "✅" "Root ESLint configuration updated"
      else
        print_message "${YELLOW}" "⚠️" "Continuing without updating ESLint configuration"
        print_message "${YELLOW}" "ℹ️" "You may encounter plugin conflicts during linting"
      fi
    else
      print_message "${GREEN}" "✅" "No ESLint configuration conflicts detected"
    fi
  fi
}

# Main function
main() {
  print_header "TruckingSemis Comprehensive Linting"

  check_toolbox
  check_npm
  check_eslint_config
  lint_frontend
  lint_backend
  check_formatting
  check_types
  run_tests

  print_header "Linting Complete"
  print_message "${GREEN}" "🎉" "All checks completed!"
}

# Run the main function
main
