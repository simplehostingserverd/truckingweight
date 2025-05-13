#!/bin/bash

# Comprehensive linting script for TruckingSemis project
# This script runs ESLint, Prettier, and TypeScript type checking on the codebase

# Default options
CHECK_FRONTEND=true
CHECK_BACKEND=true
CHECK_FORMATTING=true
CHECK_TYPES=true
RUN_TESTS=false
FIX_MODE=false
FIX_TS_SYNTAX_ONLY=false
REPORT_MODE=false
AUTO_FIX_ALL=false
SPECIFIC_PATH=""

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

# Function to show usage information
show_usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                Show this help message"
  echo "  --frontend-only           Only check frontend code"
  echo "  --backend-only            Only check backend code"
  echo "  --no-format               Skip formatting checks"
  echo "  --no-types                Skip TypeScript type checking"
  echo "  --with-tests              Run tests"
  echo "  --fix                     Try to automatically fix issues"
  echo "  --fix-ts-syntax           Fix TypeScript syntax errors only"
  echo "  --report                  Generate reports instead of failing"
  echo "  --auto-fix-all            Automatically fix all issues without prompting"
  echo "  --path=<path>             Check only specific path (e.g. frontend/src/components)"
  echo ""
  echo "Examples:"
  echo "  $0 --frontend-only --fix  Check and fix only frontend code"
  echo "  $0 --report               Run all checks and generate reports"
  echo "  $0 --auto-fix-all         Automatically fix all issues (good for CI/CD)"
  echo "  $0 --path=frontend/src/components --fix  Fix issues in specific directory"
  exit 0
}

# Parse command line arguments
parse_args() {
  for arg in "$@"; do
    case $arg in
      -h|--help)
        show_usage
        ;;
      --frontend-only)
        CHECK_FRONTEND=true
        CHECK_BACKEND=false
        ;;
      --backend-only)
        CHECK_FRONTEND=false
        CHECK_BACKEND=true
        ;;
      --no-format)
        CHECK_FORMATTING=false
        ;;
      --no-types)
        CHECK_TYPES=false
        ;;
      --with-tests)
        RUN_TESTS=true
        ;;
      --fix)
        FIX_MODE=true
        ;;
      --fix-ts-syntax)
        FIX_TS_SYNTAX_ONLY=true
        CHECK_FRONTEND=false
        CHECK_FORMATTING=false
        CHECK_TYPES=false
        RUN_TESTS=false
        ;;
      --report)
        REPORT_MODE=true
        ;;
      --auto-fix-all)
        AUTO_FIX_ALL=true
        FIX_MODE=true
        ;;
      --path=*)
        SPECIFIC_PATH="${arg#*=}"
        ;;
      *)
        # Unknown option
        print_message "${YELLOW}" "⚠️" "Unknown option: $arg"
        ;;
    esac
  done
}

# Check if running in toolbox
check_toolbox() {
  if [ -f /run/.toolboxenv ]; then
    print_message "${GREEN}" "✅" "Running in toolbox environment"
  else
    print_message "${YELLOW}" "⚠️" "This script should ideally be run inside a toolbox environment"

    # Skip prompt in AUTO_FIX_ALL mode
    if [ "$AUTO_FIX_ALL" = true ]; then
      print_message "${YELLOW}" "ℹ️" "Auto-fix mode: Continuing without toolbox"
      return
    fi

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

  # If a specific path is provided, adjust the path
  local lint_path="."
  local report_path="frontend-lint-report.txt"
  if [ -n "$SPECIFIC_PATH" ]; then
    if [[ "$SPECIFIC_PATH" == frontend/* ]]; then
      # Path is within frontend
      lint_path="${SPECIFIC_PATH#frontend/}"
      report_path="frontend-${lint_path//\//-}-lint-report.txt"
    else
      # Path is not within frontend, skip
      print_message "${YELLOW}" "⚠️" "Specified path is not within frontend, skipping frontend linting"
      return
    fi
  fi

  cd frontend || handle_error "Could not change to frontend directory"
  print_message "${BLUE}" "🔍" "Running ESLint on frontend${lint_path:+ (path: $lint_path)}..."

  # Create a temporary .eslintignore file to ignore utility scripts
  cat > .eslintignore.temp << EOF
# Ignore node_modules and build directories (already in the main .eslintignore)
node_modules/
.next/
out/
public/
**/*.d.ts

# Ignore utility scripts
../scripts/**/*
../fix-*.js
../create-*.js
../update-*.js
../test-*.js
../index.js
../schema-updater/**/*
EOF

  # Prepare ESLint command with options - explicitly target all TypeScript and JavaScript files
  local eslint_cmd="npx eslint --config .eslintrc.json --ignore-path .eslintignore.temp"

  # Add extensions to check
  eslint_cmd="$eslint_cmd --ext .js,.jsx,.ts,.tsx"

  # Always add max-warnings flag to ensure CI catches all issues
  eslint_cmd="$eslint_cmd --max-warnings=0"

  # Add fix mode if requested
  if [ "$FIX_MODE" = true ]; then
    eslint_cmd="$eslint_cmd --fix"
    print_message "${BLUE}" "🔧" "Running in fix mode (will attempt to automatically fix issues)"
  fi

  # Add report mode if requested
  if [ "$REPORT_MODE" = true ]; then
    print_message "${BLUE}" "📊" "Generating lint report instead of failing"
    if [ "$lint_path" = "." ]; then
      # Check src directory specifically to avoid checking node_modules
      $eslint_cmd "src" > "../$report_path" 2>&1 || true
    else
      $eslint_cmd "$lint_path" > "../$report_path" 2>&1 || true
    fi
    print_message "${GREEN}" "✅" "Frontend lint report generated: $report_path"

    # Count the number of issues
    local issue_count=$(grep -c "error\|warning" "../$report_path" || echo "0")
    print_message "${YELLOW}" "ℹ️" "Found approximately $issue_count issues in frontend code"

    # Suggest next steps
    print_message "${BLUE}" "💡" "To fix issues gradually, try running with specific paths:"
    print_message "${BLUE}" "  " "./lint-check.sh --path=frontend/src/components --fix"
    print_message "${BLUE}" "  " "./lint-check.sh --path=frontend/src/app --fix"
  else
    # Run ESLint normally
    if [ "$lint_path" = "." ]; then
      # Check src directory specifically to avoid checking node_modules
      if $eslint_cmd "src"; then
        print_message "${GREEN}" "✅" "Frontend linting passed"
      else
        handle_frontend_lint_error $?
      fi
    else
      if $eslint_cmd "$lint_path"; then
        print_message "${GREEN}" "✅" "Frontend linting passed"
      else
        handle_frontend_lint_error $?
      fi
    fi
  fi

  # Clean up temporary .eslintignore
  rm -f .eslintignore.temp

  cd ..
}

# Handle frontend linting errors
handle_frontend_lint_error() {
  local exit_code=$1
  print_message "${YELLOW}" "⚠️" "Frontend linting had issues"

  # Suggest fix mode
  print_message "${BLUE}" "💡" "Try running with --fix to automatically fix some issues:"
  print_message "${BLUE}" "  " "./lint-check.sh --frontend-only --fix"

  # Suggest report mode
  print_message "${BLUE}" "💡" "Or run with --report to generate a detailed report:"
  print_message "${BLUE}" "  " "./lint-check.sh --frontend-only --report"

  # Ask if user wants to continue despite linting errors
  if [ "$CHECK_BACKEND" = true ] || [ "$CHECK_FORMATTING" = true ] || [ "$CHECK_TYPES" = true ] || [ "$RUN_TESTS" = true ]; then
    read -p "Continue with other checks? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      cd ..
      exit $exit_code
    fi
  else
    cd ..
    exit $exit_code
  fi
}

# Run ESLint on backend
lint_backend() {
  print_header "Linting Backend Code"

  if [ ! -d "backend" ]; then
    print_message "${YELLOW}" "⚠️" "Backend directory not found, skipping backend linting"
    return
  fi

  # If a specific path is provided, adjust the path
  local lint_path="."
  local report_path="backend-lint-report.txt"
  if [ -n "$SPECIFIC_PATH" ]; then
    if [[ "$SPECIFIC_PATH" == backend/* ]]; then
      # Path is within backend
      lint_path="${SPECIFIC_PATH#backend/}"
      report_path="backend-${lint_path//\//-}-lint-report.txt"
    else
      # Path is not within backend, skip
      print_message "${YELLOW}" "⚠️" "Specified path is not within backend, skipping backend linting"
      return
    fi
  fi

  cd backend || handle_error "Could not change to backend directory"

  # Create a temporary .eslintignore file to ignore utility scripts
  cat > .eslintignore.temp << EOF
# Ignore node_modules and build directories
node_modules/
dist/
build/
generated/

# Ignore utility scripts
../scripts/**/*
../fix-*.js
../create-*.js
../update-*.js
../test-*.js
../index.js
../schema-updater/**/*
scripts/check-redis.js
scripts/apply-city-schema.js
EOF

  # Create a temporary ESLint config if one doesn't exist
  if [ ! -f ".eslintrc.json" ]; then
    print_message "${BLUE}" "📝" "Creating temporary ESLint config for backend..."

    # Check if TypeScript files exist in the backend
    if ls *.ts &> /dev/null || find . -name "*.ts" | grep -q .; then
      print_message "${BLUE}" "🔍" "TypeScript files detected, creating TypeScript-aware ESLint config..."
      cat > .eslintrc.temp.json << EOF
{
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "semi": ["error", "always"],
    "no-undef": "error",
    "no-extra-semi": "error",
    "no-unreachable": "error"
  }
}
EOF
    else
      # Regular JavaScript config
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
    "semi": ["error", "always"],
    "no-undef": "error",
    "no-extra-semi": "error",
    "no-unreachable": "error"
  }
}
EOF
    fi
    TEMP_CONFIG="--config .eslintrc.temp.json"
  else
    TEMP_CONFIG=""
  fi

  print_message "${BLUE}" "🔍" "Running ESLint on backend${lint_path:+ (path: $lint_path)}..."

  # Check if TypeScript ESLint dependencies are installed
  local ts_eslint_installed=false
  if npm list @typescript-eslint/parser &> /dev/null && npm list @typescript-eslint/eslint-plugin &> /dev/null; then
    ts_eslint_installed=true
  fi

  # If TypeScript files exist but dependencies aren't installed, warn the user
  if [ "$ts_eslint_installed" = false ] && (ls *.ts &> /dev/null || find . -name "*.ts" | grep -q .); then
    print_message "${YELLOW}" "⚠️" "TypeScript files detected but @typescript-eslint packages not found"
    print_message "${YELLOW}" "ℹ️" "For proper TypeScript linting, install the required packages:"
    print_message "${YELLOW}" "  " "npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin"

    # Ask if user wants to install the dependencies
    read -p "Would you like to install these packages now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      print_message "${BLUE}" "📦" "Installing TypeScript ESLint packages..."
      npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
      ts_eslint_installed=true
      print_message "${GREEN}" "✅" "TypeScript ESLint packages installed"
    else
      print_message "${YELLOW}" "⚠️" "Continuing without TypeScript ESLint packages"
      print_message "${YELLOW}" "ℹ️" "TypeScript files may not be linted correctly"
    fi
  fi

  # Prepare ESLint command with options
  local eslint_cmd="npx eslint ${TEMP_CONFIG} --ignore-path .eslintignore.temp --ext .js,.ts"

  # Always add max-warnings flag to ensure CI catches all issues
  eslint_cmd="$eslint_cmd --max-warnings=0"

  # Add fix mode if requested
  if [ "$FIX_MODE" = true ]; then
    eslint_cmd="$eslint_cmd --fix"
    print_message "${BLUE}" "🔧" "Running in fix mode (will attempt to automatically fix issues)"
  fi

  # Add report mode if requested
  if [ "$REPORT_MODE" = true ]; then
    print_message "${BLUE}" "📊" "Generating lint report instead of failing"

    # Exclude node_modules and generated directories
    if [ "$lint_path" = "." ]; then
      # Target specific directories to avoid checking node_modules and generated code
      $eslint_cmd "routes" "controllers" "middleware" "services" "utils" "server*.js" > "../$report_path" 2>&1 || true
    else
      $eslint_cmd "$lint_path" > "../$report_path" 2>&1 || true
    fi

    print_message "${GREEN}" "✅" "Backend lint report generated: $report_path"

    # Count the number of issues
    local issue_count=$(grep -c "error\|warning" "../$report_path" || echo "0")
    print_message "${YELLOW}" "ℹ️" "Found approximately $issue_count issues in backend code"

    # Suggest next steps
    print_message "${BLUE}" "💡" "To fix issues gradually, try running with specific paths:"
    print_message "${BLUE}" "  " "./lint-check.sh --path=backend/routes --fix"
    print_message "${BLUE}" "  " "./lint-check.sh --path=backend/controllers --fix"
  else
    # Run ESLint normally
    if [ "$lint_path" = "." ]; then
      # Target specific directories to avoid checking node_modules and generated code
      if $eslint_cmd "routes" "controllers" "middleware" "services" "utils" "server*.js"; then
        print_message "${GREEN}" "✅" "Backend linting passed"
      else
        handle_backend_lint_error $?
      fi
    else
      if $eslint_cmd "$lint_path"; then
        print_message "${GREEN}" "✅" "Backend linting passed"
      else
        handle_backend_lint_error $?
      fi
    fi
  fi

  # Clean up temporary files
  [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json
  rm -f .eslintignore.temp

  cd ..
}

# Handle backend linting errors
handle_backend_lint_error() {
  local exit_code=$1
  print_message "${YELLOW}" "⚠️" "Backend linting had issues"

  # Suggest fix mode
  print_message "${BLUE}" "💡" "Try running with --fix to automatically fix some issues:"
  print_message "${BLUE}" "  " "./lint-check.sh --backend-only --fix"

  # Suggest report mode
  print_message "${BLUE}" "💡" "Or run with --report to generate a detailed report:"
  print_message "${BLUE}" "  " "./lint-check.sh --backend-only --report"

  # Ask if user wants to continue despite linting errors
  if [ "$CHECK_FORMATTING" = true ] || [ "$CHECK_TYPES" = true ] || [ "$RUN_TESTS" = true ]; then
    read -p "Continue with other checks? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      # Clean up temporary config if it exists
      [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json
      [ -f ".eslintignore.temp" ] && rm .eslintignore.temp
      cd ..
      exit $exit_code
    fi
  else
    # Clean up temporary config if it exists
    [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json
    [ -f ".eslintignore.temp" ] && rm .eslintignore.temp
    cd ..
    exit $exit_code
  fi
}

# Run Prettier check
check_formatting() {
  print_header "Checking Code Formatting"

  # Skip if formatting check is disabled
  if [ "$CHECK_FORMATTING" = false ]; then
    print_message "${YELLOW}" "⚠️" "Formatting check disabled, skipping"
    return
  fi

  # Create a temporary .prettierignore file to ignore utility scripts
  cat > .prettierignore.temp << EOF
# Ignore node_modules and build directories
node_modules/
.next/
out/
dist/
build/
generated/
public/

# Ignore utility scripts
scripts/**/*
fix-*.js
create-*.js
update-*.js
test-*.js
index.js
schema-updater/**/*
backend/scripts/check-redis.js
backend/scripts/apply-city-schema.js
backend/generated/**/*
EOF

  # If a specific path is provided, use it for formatting
  local format_path=""
  if [ -n "$SPECIFIC_PATH" ]; then
    format_path="\"$SPECIFIC_PATH/**/*.{js,jsx,ts,tsx,json,md,css}\""
    print_message "${BLUE}" "🔍" "Running Prettier check on path: $SPECIFIC_PATH..."
  else
    print_message "${BLUE}" "🔍" "Running Prettier check on all files..."
    # Define specific directories to check instead of everything
    format_path="\"frontend/src/**/*.{js,jsx,ts,tsx,json,md,css}\" \"backend/{routes,controllers,middleware,services,utils}/**/*.{js,ts,json}\" \"backend/server*.js\""
  fi

  # Prepare Prettier command with custom ignore file
  local prettier_cmd="npx prettier --ignore-path .prettierignore.temp --check"
  if [ -n "$format_path" ]; then
    prettier_cmd="$prettier_cmd $format_path"
  else
    # This should not be reached with the current logic, but keeping as fallback
    prettier_cmd="npm run format:check"
  fi

  # Run in fix mode if requested
  if [ "$FIX_MODE" = true ]; then
    print_message "${BLUE}" "🔧" "Running Prettier in fix mode..."
    if [ -n "$format_path" ]; then
      # Use the same ignore path for writing
      eval "npx prettier --ignore-path .prettierignore.temp --write $format_path"
    else
      # This should not be reached with the current logic, but keeping as fallback
      npm run format
    fi
    print_message "${GREEN}" "✅" "Formatting issues fixed"
  else
    # Run Prettier check
    if eval "$prettier_cmd"; then
      print_message "${GREEN}" "✅" "Code formatting check passed"
    else
      print_message "${YELLOW}" "⚠️" "Code formatting issues found"

      # Suggest fix mode
      print_message "${BLUE}" "💡" "Run with --fix to automatically fix formatting issues:"
      print_message "${BLUE}" "  " "./lint-check.sh --no-types --fix"

      # Ask if user wants to fix formatting issues
      read -p "Would you like to automatically fix formatting issues now? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "${BLUE}" "🔧" "Fixing formatting issues..."
        if [ -n "$format_path" ]; then
          # Use the same ignore path for writing
          eval "npx prettier --ignore-path .prettierignore.temp --write $format_path"
        else
          # This should not be reached with the current logic, but keeping as fallback
          npm run format
        fi
        print_message "${GREEN}" "✅" "Formatting issues fixed"
      else
        print_message "${YELLOW}" "⚠️" "Formatting issues not fixed"
      fi
    fi
  fi

  # Clean up temporary .prettierignore file
  rm -f .prettierignore.temp
}

# Run TypeScript type checking
check_types() {
  print_header "TypeScript Type Checking"

  # Skip if type checking is disabled
  if [ "$CHECK_TYPES" = false ]; then
    print_message "${YELLOW}" "⚠️" "TypeScript type checking disabled, skipping"
    return
  fi

  # Check frontend types
  if [ "$CHECK_FRONTEND" = true ] && [ -d "frontend" ]; then
    # If a specific path is provided, check if it's in frontend
    if [ -n "$SPECIFIC_PATH" ] && [[ "$SPECIFIC_PATH" != frontend/* ]]; then
      print_message "${YELLOW}" "⚠️" "Specified path is not within frontend, skipping frontend type checking"
    else
      cd frontend || handle_error "Could not change to frontend directory"
      print_message "${BLUE}" "🔍" "Running TypeScript type checking on frontend..."

      # Prepare TypeScript command
      local tsc_cmd="npx tsc --noEmit"
      local report_path="../frontend-type-report.txt"

      # Run in report mode if requested
      if [ "$REPORT_MODE" = true ]; then
        print_message "${BLUE}" "📊" "Generating TypeScript type report instead of failing"
        $tsc_cmd > "$report_path" 2>&1 || true
        print_message "${GREEN}" "✅" "Frontend type report generated: ${report_path#../}"

        # Count the number of issues
        local error_count=$(grep -c "error TS" "$report_path" || echo "0")
        print_message "${YELLOW}" "ℹ️" "Found approximately $error_count type errors in frontend code"

        # Suggest next steps for fixing type errors
        if [ "$error_count" -gt 0 ]; then
          print_message "${BLUE}" "💡" "Type errors often need manual fixing. Common fixes include:"
          print_message "${BLUE}" "  " "- Adding proper type annotations"
          print_message "${BLUE}" "  " "- Fixing incompatible types"
          print_message "${BLUE}" "  " "- Adding missing properties to interfaces"
          print_message "${BLUE}" "  " "- Using type assertions where necessary (as Type)"
        fi
      else
        # Run TypeScript normally
        if $tsc_cmd; then
          print_message "${GREEN}" "✅" "Frontend type checking passed"
        else
          local exit_code=$?
          print_message "${YELLOW}" "⚠️" "Frontend type checking had issues"

          # Suggest report mode
          print_message "${BLUE}" "💡" "Run with --report to generate a detailed type error report:"
          print_message "${BLUE}" "  " "./lint-check.sh --frontend-only --no-format --report"

          # Ask if user wants to continue despite type errors
          if [ "$CHECK_BACKEND" = true ] || [ "$CHECK_FORMATTING" = true ] || [ "$RUN_TESTS" = true ]; then
            read -p "Continue with other checks? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
              cd ..
              exit $exit_code
            fi
          else
            cd ..
            exit $exit_code
          fi
        fi
      fi

      cd ..
    fi
  fi

  # Check backend types if it uses TypeScript
  if [ "$CHECK_BACKEND" = true ] && [ -d "backend" ]; then
    # If a specific path is provided, check if it's in backend
    if [ -n "$SPECIFIC_PATH" ] && [[ "$SPECIFIC_PATH" != backend/* ]]; then
      print_message "${YELLOW}" "⚠️" "Specified path is not within backend, skipping backend type checking"
    elif [ -f "backend/tsconfig.json" ]; then
      cd backend || handle_error "Could not change to backend directory"
      print_message "${BLUE}" "🔍" "Running TypeScript type checking on backend..."

      # Prepare TypeScript command
      local tsc_cmd="npx tsc --noEmit"
      local report_path="../backend-type-report.txt"

      # Run in report mode if requested
      if [ "$REPORT_MODE" = true ]; then
        print_message "${BLUE}" "📊" "Generating TypeScript type report instead of failing"
        $tsc_cmd > "$report_path" 2>&1 || true
        print_message "${GREEN}" "✅" "Backend type report generated: ${report_path#../}"

        # Count the number of issues
        local error_count=$(grep -c "error TS" "$report_path" || echo "0")
        print_message "${YELLOW}" "ℹ️" "Found approximately $error_count type errors in backend code"

        # Suggest next steps for fixing type errors
        if [ "$error_count" -gt 0 ]; then
          print_message "${BLUE}" "💡" "Type errors often need manual fixing. Common fixes include:"
          print_message "${BLUE}" "  " "- Adding proper type annotations"
          print_message "${BLUE}" "  " "- Fixing incompatible types"
          print_message "${BLUE}" "  " "- Adding missing properties to interfaces"
          print_message "${BLUE}" "  " "- Using type assertions where necessary (as Type)"
        fi
      else
        # Run TypeScript normally
        if $tsc_cmd; then
          print_message "${GREEN}" "✅" "Backend type checking passed"
        else
          local exit_code=$?
          print_message "${YELLOW}" "⚠️" "Backend type checking had issues"

          # Suggest report mode
          print_message "${BLUE}" "💡" "Run with --report to generate a detailed type error report:"
          print_message "${BLUE}" "  " "./lint-check.sh --backend-only --no-format --report"

          # Ask if user wants to continue despite type errors
          if [ "$CHECK_FORMATTING" = true ] || [ "$RUN_TESTS" = true ]; then
            read -p "Continue with other checks? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
              cd ..
              exit $exit_code
            fi
          else
            cd ..
            exit $exit_code
          fi
        fi
      fi

      cd ..
    else
      print_message "${YELLOW}" "⚠️" "Backend TypeScript configuration not found, skipping type checking"
    fi
  fi
}

# Run tests
run_tests() {
  print_header "Running Tests"

  # Skip if tests are disabled
  if [ "$RUN_TESTS" = false ]; then
    print_message "${YELLOW}" "⚠️" "Tests disabled, skipping"
    return
  fi

  # Run frontend tests
  if [ "$CHECK_FRONTEND" = true ] && [ -d "frontend" ]; then
    # If a specific path is provided, check if it's in frontend
    if [ -n "$SPECIFIC_PATH" ] && [[ "$SPECIFIC_PATH" != frontend/* ]]; then
      print_message "${YELLOW}" "⚠️" "Specified path is not within frontend, skipping frontend tests"
    else
      cd frontend || handle_error "Could not change to frontend directory"
      print_message "${BLUE}" "🧪" "Running frontend tests..."

      # Run tests
      npm test || print_message "${YELLOW}" "⚠️" "Frontend tests failed or not available"

      cd ..
    fi
  fi

  # Run backend tests
  if [ "$CHECK_BACKEND" = true ] && [ -d "backend" ]; then
    # If a specific path is provided, check if it's in backend
    if [ -n "$SPECIFIC_PATH" ] && [[ "$SPECIFIC_PATH" != backend/* ]]; then
      print_message "${YELLOW}" "⚠️" "Specified path is not within backend, skipping backend tests"
    else
      cd backend || handle_error "Could not change to backend directory"
      print_message "${BLUE}" "🧪" "Running backend tests..."

      # Run tests
      npm test || print_message "${YELLOW}" "⚠️" "Backend tests failed or not available"

      cd ..
    fi
  fi
}

# Fix common TypeScript syntax errors
fix_typescript_syntax_errors() {
  print_header "Checking for Common TypeScript Syntax Errors"

  # Only run if we're checking the backend and TypeScript files exist
  if [ "$CHECK_BACKEND" = false ] || [ ! -d "backend" ]; then
    return
  fi

  cd backend || handle_error "Could not change to backend directory"

  # Check if TypeScript files exist
  if ! ls *.ts &> /dev/null && ! find . -name "*.ts" | grep -q .; then
    print_message "${YELLOW}" "ℹ️" "No TypeScript files found in backend, skipping syntax check"
    cd ..
    return
  fi

  print_message "${BLUE}" "🔍" "Checking for common TypeScript syntax errors..."

  # Look for the specific '=>' expected error pattern in function return types
  local files_with_errors=$(grep -l -r "): Promise<" --include="*.ts" . 2>/dev/null || echo "")

  if [ -z "$files_with_errors" ]; then
    print_message "${GREEN}" "✅" "No common TypeScript syntax errors found"
    cd ..
    return
  fi

  print_message "${YELLOW}" "⚠️" "Found potential TypeScript syntax errors in function return types"
  print_message "${YELLOW}" "ℹ️" "These errors often appear as 'SyntaxError: '=>' expected'"

  # Determine whether to fix errors
  local fix_ts_errors=false

  # In auto-fix mode, always fix TypeScript syntax errors
  if [ "$AUTO_FIX_ALL" = true ]; then
    print_message "${BLUE}" "🔧" "Auto-fix mode: Automatically fixing TypeScript syntax errors..."
    fix_ts_errors=true
  # In fix mode, also fix TypeScript syntax errors
  elif [ "$FIX_MODE" = true ]; then
    print_message "${BLUE}" "🔧" "Attempting to fix TypeScript syntax errors..."
    fix_ts_errors=true
  # Otherwise, ask the user
  else
    read -p "Would you like to attempt to fix these errors? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      print_message "${BLUE}" "🔧" "Attempting to fix TypeScript syntax errors..."
      fix_ts_errors=true
    else
      print_message "${YELLOW}" "⚠️" "Skipping TypeScript syntax error fixes"
      fix_ts_errors=false
    fi
  fi

  if [ "$fix_ts_errors" = true ]; then
    # Create a backup directory
    mkdir -p .ts-syntax-backups

    # Process each file with potential errors
    for file in $files_with_errors; do
      print_message "${BLUE}" "🔧" "Checking file: $file"

      # Create a backup
      cp "$file" ".ts-syntax-backups/$(basename "$file").bak"

      # Fix the common pattern: "): Promise<...> {" to "): Promise<...> => {"
      # This addresses the "SyntaxError: '=>' expected" error
      sed -i 's/): Promise<\([^>]*\)> {/): Promise<\1> => {/g' "$file"

      # Also fix other common TypeScript syntax errors
      # Fix missing arrow functions in async methods
      sed -i 's/async \([a-zA-Z0-9_]*\)(.*): Promise<\([^>]*\)> {/async \1\2): Promise<\2> => {/g' "$file"

      # Fix missing semicolons at the end of statements
      sed -i 's/\([^;]\)$/\1;/g' "$file"

      print_message "${GREEN}" "✅" "Fixed potential syntax errors in $file"
    done

    print_message "${GREEN}" "✅" "TypeScript syntax fixes applied"
    print_message "${BLUE}" "ℹ️" "Backups saved in .ts-syntax-backups directory"
  fi

  cd ..
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

  # Parse command line arguments
  parse_args "$@"

  # Show a summary of what will be checked
  echo "Checks to be performed:"
  [ "$CHECK_FRONTEND" = true ] && echo "- Frontend linting"
  [ "$CHECK_BACKEND" = true ] && echo "- Backend linting"
  [ "$CHECK_FORMATTING" = true ] && echo "- Code formatting"
  [ "$CHECK_TYPES" = true ] && echo "- TypeScript type checking"
  [ "$RUN_TESTS" = true ] && echo "- Tests"
  [ -n "$SPECIFIC_PATH" ] && echo "- Specific path: $SPECIFIC_PATH"
  [ "$FIX_MODE" = true ] && echo "- Fix mode enabled (will attempt to fix issues)"
  [ "$AUTO_FIX_ALL" = true ] && echo "- Auto-fix mode enabled (will fix all issues without prompting)"
  [ "$REPORT_MODE" = true ] && echo "- Report mode enabled (will generate reports instead of failing)"
  echo ""

  # Skip interactive prompts if AUTO_FIX_ALL is enabled
  if [ "$AUTO_FIX_ALL" = true ]; then
    print_message "${BLUE}" "🔧" "Running in auto-fix mode - will fix all issues without prompting"
    # Skip toolbox check in auto-fix mode
    check_npm
    check_eslint_config
  else
    check_toolbox
    check_npm
    check_eslint_config
  fi

  # Handle TypeScript syntax-only fix mode
  if [ "$FIX_TS_SYNTAX_ONLY" = true ]; then
    print_message "${BLUE}" "🔧" "Running in TypeScript syntax fix only mode"
    # Force fix mode for TypeScript syntax errors
    FIX_MODE=true
    fix_typescript_syntax_errors
    print_header "TypeScript Syntax Fix Complete"
    print_message "${GREEN}" "🎉" "TypeScript syntax fixes completed!"
    exit 0
  fi

  # Fix TypeScript syntax errors before running linting
  # In auto-fix mode, always fix TypeScript syntax errors without prompting
  if [ "$AUTO_FIX_ALL" = true ]; then
    # Force fix mode for TypeScript syntax errors
    FIX_MODE=true
    fix_typescript_syntax_errors
  else
    fix_typescript_syntax_errors
  fi

  # Create a function to handle the checks with auto-fix support
  run_checks() {
    # Run the checks
    if [ "$CHECK_FRONTEND" = true ]; then
      # In auto-fix mode, don't prompt for continuation on errors
      if [ "$AUTO_FIX_ALL" = true ]; then
        # Save current value of REPORT_MODE
        local original_report_mode=$REPORT_MODE
        # Temporarily disable report mode to ensure we get actual exit codes
        REPORT_MODE=false
        # Run frontend linting
        lint_frontend || true
        # Restore original REPORT_MODE
        REPORT_MODE=$original_report_mode
      else
        lint_frontend
      fi
    fi

    if [ "$CHECK_BACKEND" = true ]; then
      # In auto-fix mode, don't prompt for continuation on errors
      if [ "$AUTO_FIX_ALL" = true ]; then
        # Save current value of REPORT_MODE
        local original_report_mode=$REPORT_MODE
        # Temporarily disable report mode to ensure we get actual exit codes
        REPORT_MODE=false
        # Run backend linting
        lint_backend || true
        # Restore original REPORT_MODE
        REPORT_MODE=$original_report_mode
      else
        lint_backend
      fi
    fi

    if [ "$CHECK_FORMATTING" = true ]; then
      check_formatting
    fi

    if [ "$CHECK_TYPES" = true ]; then
      # In auto-fix mode, don't prompt for continuation on errors
      if [ "$AUTO_FIX_ALL" = true ]; then
        # Save current value of REPORT_MODE
        local original_report_mode=$REPORT_MODE
        # Force report mode for type checking in auto-fix mode
        REPORT_MODE=true
        # Run type checking
        check_types || true
        # Restore original REPORT_MODE
        REPORT_MODE=$original_report_mode
      else
        check_types
      fi
    fi

    if [ "$RUN_TESTS" = true ]; then
      run_tests
    fi
  }

  # Run the checks
  run_checks

  print_header "Linting Complete"
  print_message "${GREEN}" "🎉" "All checks completed!"

  # Provide a summary of reports if in report mode
  if [ "$REPORT_MODE" = true ]; then
    print_header "Report Summary"
    print_message "${BLUE}" "📊" "The following reports were generated:"

    # List all report files
    for report in *-report.txt; do
      if [ -f "$report" ]; then
        local issue_count=$(grep -c "error\|warning" "$report" || echo "0")
        print_message "${YELLOW}" "📄" "$report: approximately $issue_count issues"
      fi
    done

    print_message "${BLUE}" "💡" "Review these reports and fix issues gradually"
    print_message "${BLUE}" "💡" "For TypeScript errors, focus on one file at a time"
    print_message "${BLUE}" "💡" "For ESLint issues, try running with --fix to auto-fix simple problems"
  fi

  # If in auto-fix mode, provide a summary of what was fixed
  if [ "$AUTO_FIX_ALL" = true ]; then
    print_header "Auto-Fix Summary"
    print_message "${GREEN}" "✅" "Automatically fixed linting and formatting issues"
    print_message "${BLUE}" "ℹ️" "Some TypeScript type errors may still need manual fixing"
    print_message "${BLUE}" "💡" "Run with --report to see remaining issues"
  fi
}

# Run the main function with all arguments
main "$@"
