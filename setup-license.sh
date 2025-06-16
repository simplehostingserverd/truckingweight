#!/bin/bash

echo ""
echo "========================================"
echo "  Trucking Weight Management System"
echo "  License Configuration Tool"
echo "========================================"
echo ""
echo "This tool will help you configure an offline license"
echo "for your Trucking Weight Management System installation."
echo ""
read -p "Press Enter to continue..."

node license-config-tool.js

echo ""
echo "License configuration complete!"
echo ""
echo "Next steps:"
echo "1. Restart your development server (npm run dev)"
echo "2. The application will now use offline license verification"
echo "3. Check the console for license verification messages"
echo ""
read -p "Press Enter to exit..."
