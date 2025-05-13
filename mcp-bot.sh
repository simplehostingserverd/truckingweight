#!/bin/bash

# MCP Bot - Automatic Linting and Formatting Fixer
# This script automatically fixes linting and formatting issues,
# installs missing packages, and generates a comprehensive report.

# Set colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print a styled header
print_header() {
  echo -e "\n${BLUE}=== ${1} ===${NC}\n"
}

# Print a styled message
print_message() {
  local color=$1
  local icon=$2
  local message=$3
  echo -e "${color}${icon} ${message}${NC}"
}

# Handle errors
handle_error() {
  print_message "${RED}" "❌" "$1"
  exit 1
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Install a missing package
install_package() {
  local package=$1
  print_message "${YELLOW}" "📦" "Installing missing package: $package"
  npm install --save-dev $package || handle_error "Failed to install $package"
  print_message "${GREEN}" "✅" "Successfully installed $package"
}

# Check for missing packages and install them
check_and_install_packages() {
  print_header "Checking for Missing Packages"

  # List of essential packages for linting and formatting
  local packages=(
    "eslint"
    "prettier"
    "typescript"
    "@typescript-eslint/parser"
    "@typescript-eslint/eslint-plugin"
    "eslint-plugin-react"
    "eslint-plugin-react-hooks"
    "eslint-plugin-import"
    "eslint-plugin-jsx-a11y"
    "eslint-config-prettier"
    "eslint-plugin-prettier"
  )

  for package in "${packages[@]}"; do
    if ! npm list $package --depth=0 >/dev/null 2>&1; then
      install_package $package
    else
      print_message "${GREEN}" "✓" "$package is already installed"
    fi
  done
}

# Fix linting issues in the frontend
fix_frontend_linting() {
  print_header "Fixing Frontend Linting Issues"

  if [ ! -d "frontend" ]; then
    print_message "${YELLOW}" "⚠️" "Frontend directory not found, skipping"
    return
  fi

  cd frontend || handle_error "Could not change to frontend directory"

  print_message "${BLUE}" "🔍" "Running ESLint with auto-fix in frontend..."
  npx eslint --fix --max-warnings=0 "src/**/*.{js,jsx,ts,tsx}" || true

  print_message "${BLUE}" "💅" "Running Prettier in frontend..."
  npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}" || true

  print_message "${GREEN}" "✅" "Frontend linting and formatting fixes applied"

  cd ..
}

# Fix linting issues in the backend
fix_backend_linting() {
  print_header "Fixing Backend Linting Issues"

  if [ ! -d "backend" ]; then
    print_message "${YELLOW}" "⚠️" "Backend directory not found, skipping"
    return
  fi

  cd backend || handle_error "Could not change to backend directory"

  print_message "${BLUE}" "🔍" "Running ESLint with auto-fix in backend..."
  npx eslint --fix "**/*.{js,ts}" --ignore-pattern "node_modules/" || true

  print_message "${BLUE}" "💅" "Running Prettier in backend..."
  npx prettier --write "**/*.{js,ts,json,md}" --ignore-path .gitignore || true

  print_message "${GREEN}" "✅" "Backend linting and formatting fixes applied"

  cd ..
}

# Fix TypeScript syntax errors
fix_typescript_syntax_errors() {
  print_header "Fixing TypeScript Syntax Errors"

  # Check backend TypeScript files
  if [ -d "backend" ]; then
    cd backend || handle_error "Could not change to backend directory"

    # Create a backup directory
    mkdir -p .ts-syntax-backups

    # Find TypeScript files with common syntax errors
    local files_with_errors=$(grep -l -r "): Promise<" --include="*.ts" . 2>/dev/null || echo "")

    if [ -n "$files_with_errors" ]; then
      print_message "${YELLOW}" "⚠️" "Found potential TypeScript syntax errors in backend"

      # Process each file with potential errors
      for file in $files_with_errors; do
        print_message "${BLUE}" "🔧" "Fixing file: $file"

        # Create a backup
        cp "$file" ".ts-syntax-backups/$(basename "$file").bak"

        # Fix common TypeScript syntax errors
        # 1. Fix missing arrow functions in async methods returning Promise
        sed -i 's/): Promise<\([^>]*\)> {/): Promise<\1> => {/g' "$file"

        # 2. Fix interface declarations with trailing semicolons
        sed -i 's/interface \([A-Za-z0-9_]*\) {;/interface \1 {/g' "$file"

        # 3. Fix object literals with trailing semicolons
        sed -i 's/= {;/= {/g' "$file"

        # 4. Fix missing semicolons at the end of statements
        sed -i 's/\([^;{]\)$/\1;/g' "$file"

        print_message "${GREEN}" "✅" "Fixed potential syntax errors in $file"
      done
    else
      print_message "${GREEN}" "✅" "No common TypeScript syntax errors found in backend"
    fi

    cd ..
  fi

  # Check frontend TypeScript files
  if [ -d "frontend" ]; then
    cd frontend || handle_error "Could not change to frontend directory"

    # Create a backup directory
    mkdir -p .ts-syntax-backups

    # Find TypeScript files with common syntax errors
    local files_with_errors=$(grep -l -r "): Promise<" --include="*.ts" --include="*.tsx" src 2>/dev/null || echo "")

    if [ -n "$files_with_errors" ]; then
      print_message "${YELLOW}" "⚠️" "Found potential TypeScript syntax errors in frontend"

      # Process each file with potential errors
      for file in $files_with_errors; do
        print_message "${BLUE}" "🔧" "Fixing file: $file"

        # Create a backup
        cp "$file" ".ts-syntax-backups/$(basename "$file").bak"

        # Fix common TypeScript syntax errors
        # 1. Fix missing arrow functions in async methods returning Promise
        sed -i 's/): Promise<\([^>]*\)> {/): Promise<\1> => {/g' "$file"

        print_message "${GREEN}" "✅" "Fixed potential syntax errors in $file"
      done
    else
      print_message "${GREEN}" "✅" "No common TypeScript syntax errors found in frontend"
    fi

    cd ..
  fi
}

# Generate a comprehensive report of remaining issues
generate_report() {
  print_header "Generating Comprehensive Report"

  local report_file="mcp-bot-report.md"

  # Start the report
  cat > "$report_file" << EOF
# MCP Bot Report - $(date)

This report contains information about remaining issues that need to be fixed manually.

## Summary

EOF

  # Check frontend issues
  if [ -d "frontend" ]; then
    cd frontend || handle_error "Could not change to frontend directory"

    echo "### Frontend Issues" >> "../$report_file"

    # Check ESLint issues
    echo -e "\n#### ESLint Issues" >> "../$report_file"
    npx eslint "src/**/*.{js,jsx,ts,tsx}" --max-warnings=0 > eslint-report.txt 2>&1 || true
    local eslint_count=$(grep -c "error\|warning" eslint-report.txt || echo "0")
    echo "- Found approximately $eslint_count ESLint issues" >> "../$report_file"

    # Check TypeScript issues
    echo -e "\n#### TypeScript Issues" >> "../$report_file"
    npx tsc --noEmit > typescript-report.txt 2>&1 || true
    local ts_count=$(grep -c "error TS" typescript-report.txt || echo "0")
    echo "- Found approximately $ts_count TypeScript type errors" >> "../$report_file"

    # Add sample issues to the report
    if [ "$eslint_count" -gt 0 ]; then
      echo -e "\n##### Sample ESLint Issues:" >> "../$report_file"
      head -n 10 eslint-report.txt >> "../$report_file"
      echo -e "\n..." >> "../$report_file"
    fi

    if [ "$ts_count" -gt 0 ]; then
      echo -e "\n##### Sample TypeScript Issues:" >> "../$report_file"
      head -n 10 typescript-report.txt >> "../$report_file"
      echo -e "\n..." >> "../$report_file"
    fi

    cd ..
  fi

  # Check backend issues
  if [ -d "backend" ]; then
    cd backend || handle_error "Could not change to backend directory"

    echo -e "\n### Backend Issues" >> "../$report_file"

    # Check ESLint issues
    echo -e "\n#### ESLint Issues" >> "../$report_file"
    npx eslint "**/*.{js,ts}" --ignore-pattern "node_modules/" > eslint-report.txt 2>&1 || true
    local eslint_count=$(grep -c "error\|warning" eslint-report.txt || echo "0")
    echo "- Found approximately $eslint_count ESLint issues" >> "../$report_file"

    # Check TypeScript issues
    echo -e "\n#### TypeScript Issues" >> "../$report_file"
    if [ -f "tsconfig.json" ]; then
      npx tsc --noEmit > typescript-report.txt 2>&1 || true
      local ts_count=$(grep -c "error TS" typescript-report.txt || echo "0")
      echo "- Found approximately $ts_count TypeScript type errors" >> "../$report_file"
    else
      echo "- No TypeScript configuration found" >> "../$report_file"
    fi

    # Add sample issues to the report
    if [ "$eslint_count" -gt 0 ]; then
      echo -e "\n##### Sample ESLint Issues:" >> "../$report_file"
      head -n 10 eslint-report.txt >> "../$report_file"
      echo -e "\n..." >> "../$report_file"
    fi

    if [ -f "tsconfig.json" ] && [ "$ts_count" -gt 0 ]; then
      echo -e "\n##### Sample TypeScript Issues:" >> "../$report_file"
      head -n 10 typescript-report.txt >> "../$report_file"
      echo -e "\n..." >> "../$report_file"
    fi

    cd ..
  fi

  # Add recommendations to the report
  cat >> "$report_file" << EOF

## Recommendations

### How to Fix Remaining Issues

1. **ESLint Issues**:
   - Run \`npm run lint:fix\` to automatically fix more issues
   - Manually address remaining issues by following ESLint error messages

2. **TypeScript Issues**:
   - Add proper type annotations to variables and function parameters
   - Fix incompatible types by ensuring correct type usage
   - Add missing properties to interfaces
   - Use type assertions where necessary (as Type)

3. **Common Fixes for TypeScript Errors**:
   - "Property does not exist on type": Add the property to the interface or type
   - "Type X is not assignable to type Y": Ensure types are compatible
   - "Cannot find name X": Import the required module or define the variable
   - "Parameter X implicitly has an any type": Add explicit type annotations

### Preventing Future Issues

1. **Use the Pre-Push Hooks**:
   - Never bypass pre-push hooks with \`--no-verify\`
   - Fix issues locally before pushing to the repository

2. **Run Linting Regularly**:
   - Use \`npm run lint:check\` before committing changes
   - Use \`npm run lint:check:fix\` to automatically fix issues

3. **Configure Your IDE**:
   - Set up ESLint and Prettier plugins in your IDE
   - Enable "Format on Save" for automatic formatting

EOF

  print_message "${GREEN}" "✅" "Report generated: $report_file"
}

# Main function
main() {
  print_header "MCP Bot - Automatic Linting and Formatting Fixer"

  # Check for required tools
  command_exists npm || handle_error "npm is required but not installed"
  command_exists npx || handle_error "npx is required but not installed"
  command_exists grep || handle_error "grep is required but not installed"
  command_exists sed || handle_error "sed is required but not installed"

  # Check and install missing packages
  check_and_install_packages

  # Fix TypeScript syntax errors
  fix_typescript_syntax_errors

  # Fix linting and formatting issues
  fix_frontend_linting
  fix_backend_linting

  # Run the comprehensive linting script if it exists
  if [ -f "lint-check.sh" ]; then
    print_header "Running Comprehensive Linting Check"
    print_message "${BLUE}" "🔍" "Running lint-check.sh with auto-fix..."
    chmod +x lint-check.sh
    ./lint-check.sh --auto-fix-all --report || true
  fi

  # Generate a comprehensive report
  generate_report

  print_header "MCP Bot Completed"
  print_message "${GREEN}" "🎉" "Linting and formatting fixes applied!"
  print_message "${BLUE}" "📊" "Check mcp-bot-report.md for details on remaining issues"
  print_message "${YELLOW}" "⚠️" "Some issues may require manual fixing"
}

# Run the main function
main
