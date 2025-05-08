#!/bin/bash

# Script to install dependencies and generate icons

# Check if we're in a toolbox environment
if [ -f /run/.toolboxenv ]; then
  echo "Running in toolbox environment..."
else
  echo "This script should be run inside a toolbox environment."
  echo "Please run 'toolbox enter' first, then run this script again."
  exit 1
fi

# Navigate to the project root
cd "$(dirname "$0")/.." || exit 1

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm is not installed. Installing Node.js and npm..."
  sudo dnf install -y nodejs npm
fi

# Install sharp for image processing
echo "Installing sharp package..."
cd scripts
npm install sharp

# Run the icon generation script
echo "Generating icons..."
node generate-icons.js

echo "Icon generation complete!"
echo "Check the frontend/public/icons directory for the generated icons."
