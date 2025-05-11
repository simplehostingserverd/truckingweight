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
REPORT_MODE=false
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
  echo "  --report                  Generate reports instead of failing"
  echo "  --path=<path>             Check only specific path (e.g. frontend/src/components)"
  echo ""
  echo "Examples:"
  echo "  $0 --frontend-only --fix  Check and fix only frontend code"
  echo "  $0 --report               Run all checks and generate reports"
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
      --report)
        REPORT_MODE=true
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

  # Prepare ESLint command with options
  local eslint_cmd="npx eslint --config .eslintrc.json"

  # Add fix mode if requested
  if [ "$FIX_MODE" = true ]; then
    eslint_cmd="$eslint_cmd --fix"
    print_message "${BLUE}" "🔧" "Running in fix mode (will attempt to automatically fix issues)"
  fi

  # Add report mode if requested
  if [ "$REPORT_MODE" = true ]; then
    print_message "${BLUE}" "📊" "Generating lint report instead of failing"
    $eslint_cmd "$lint_path" > "../$report_path" 2>&1 || true
    print_message "${GREEN}" "✅" "Frontend lint report generated: $report_path"

    # Count the number of issues
    local issue_count=$(grep -c "error\|warning" "../$report_path" || echo "0")
    print_message "${YELLOW}" "ℹ️" "Found approximately $issue_count issues in frontend code"

    # Suggest next steps
    print_message "${BLUE}" "💡" "To fix issues gradually, try running with specific paths:"
    print_message "${BLUE}" "  " "./lint-check.sh --path=frontend/src/components --fix"
    print_message "${BLUE}" "  " "./lint-check.sh --path=frontend/src/pages --fix"
  else
    # Run ESLint normally
    if $eslint_cmd "$lint_path"; then
      print_message "${GREEN}" "✅" "Frontend linting passed"
    else
      local exit_code=$?
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

  print_message "${BLUE}" "🔍" "Running ESLint on backend${lint_path:+ (path: $lint_path)}..."

  # Prepare ESLint command with options
  local eslint_cmd="npx eslint ${TEMP_CONFIG} --ext .js,.ts"

  # Add fix mode if requested
  if [ "$FIX_MODE" = true ]; then
    eslint_cmd="$eslint_cmd --fix"
    print_message "${BLUE}" "🔧" "Running in fix mode (will attempt to automatically fix issues)"
  fi

  # Add report mode if requested
  if [ "$REPORT_MODE" = true ]; then
    print_message "${BLUE}" "📊" "Generating lint report instead of failing"
    $eslint_cmd "$lint_path" > "../$report_path" 2>&1 || true
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
    if $eslint_cmd "$lint_path"; then
      print_message "${GREEN}" "✅" "Backend linting passed"
    else
      local exit_code=$?
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
          cd ..
          exit $exit_code
        fi
      else
        # Clean up temporary config if it exists
        [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json
        cd ..
        exit $exit_code
      fi
    fi
  fi

  # Clean up temporary config if it exists
  [ -f ".eslintrc.temp.json" ] && rm .eslintrc.temp.json

  cd ..
}

# Run Prettier check
check_formatting() {
  print_header "Checking Code Formatting"

  # Skip if formatting check is disabled
  if [ "$CHECK_FORMATTING" = false ]; then
    print_message "${YELLOW}" "⚠️" "Formatting check disabled, skipping"
    return
  fi

  # If a specific path is provided, use it for formatting
  local format_path=""
  if [ -n "$SPECIFIC_PATH" ]; then
    format_path="\"$SPECIFIC_PATH/**/*.{js,jsx,ts,tsx,json,md,css}\""
    print_message "${BLUE}" "🔍" "Running Prettier check on path: $SPECIFIC_PATH..."
  else
    print_message "${BLUE}" "🔍" "Running Prettier check on all files..."
  fi

  # Prepare Prettier command
  local prettier_cmd="npx prettier --check"
  if [ -n "$format_path" ]; then
    prettier_cmd="$prettier_cmd $format_path"
  else
    prettier_cmd="npm run format:check"
  fi

  # Run in fix mode if requested
  if [ "$FIX_MODE" = true ]; then
    print_message "${BLUE}" "🔧" "Running Prettier in fix mode..."
    if [ -n "$format_path" ]; then
      eval "npx prettier --write $format_path"
    else
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
          eval "npx prettier --write $format_path"
        else
          npm run format
        fi
        print_message "${GREEN}" "✅" "Formatting issues fixed"
      else
        print_message "${YELLOW}" "⚠️" "Formatting issues not fixed"
      fi
    fi
  fi
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
  [ "$REPORT_MODE" = true ] && echo "- Report mode enabled (will generate reports instead of failing)"
  echo ""

  check_toolbox
  check_npm
  check_eslint_config

  # Run the checks
  [ "$CHECK_FRONTEND" = true ] && lint_frontend
  [ "$CHECK_BACKEND" = true ] && lint_backend
  [ "$CHECK_FORMATTING" = true ] && check_formatting
  [ "$CHECK_TYPES" = true ] && check_types
  [ "$RUN_TESTS" = true ] && run_tests

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
}

# Run the main function with all arguments
main "$@"
