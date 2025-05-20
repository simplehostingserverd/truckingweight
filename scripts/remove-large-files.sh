#!/bin/bash
# Script to remove large files from git tracking without deleting them from the filesystem

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "${YELLOW}This script will remove large files from git tracking without deleting them from the filesystem.${NC}"
echo "${YELLOW}It will create a backup of your current working directory first.${NC}"
echo "${YELLOW}Press Ctrl+C to cancel or Enter to continue...${NC}"
read

# Create backup directory
backup_dir="backup-files/git-cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

# Backup important files
echo "${YELLOW}Creating backup...${NC}"
cp -r .git "$backup_dir/.git"
echo "${GREEN}Backup created in $backup_dir${NC}"

# Remove video files from git tracking
echo "${YELLOW}Removing video files from git tracking...${NC}"
git rm --cached frontend/public/videos/*.mp4 frontend/public/videos/*.webm frontend/public/videos/*.mov frontend/public/videos/*.avi frontend/public/videos/*.mkv frontend/public/videos/*.wmv 2>/dev/null || true

# Remove Cesium assets from git tracking
echo "${YELLOW}Removing Cesium assets from git tracking...${NC}"
git rm --cached -r frontend/public/cesium/ 2>/dev/null || true

# Remove any other large files
echo "${YELLOW}Checking for other large files (>10MB)...${NC}"
large_files=$(find . -type f -size +10M -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/backup-files/*")

if [ -n "$large_files" ]; then
  echo "${YELLOW}Found the following large files:${NC}"
  echo "$large_files" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "${YELLOW}- $file ($size)${NC}"
    git rm --cached "$file" 2>/dev/null || true
  done
fi

# Commit the changes
echo "${YELLOW}Committing changes...${NC}"
git commit -m "Remove large files from git tracking (files remain in filesystem)" || true

echo "${GREEN}Done! Large files have been removed from git tracking but remain in your filesystem.${NC}"
echo "${GREEN}Make sure to push these changes to GitHub.${NC}"
echo "${YELLOW}If anything went wrong, you can restore from the backup in $backup_dir${NC}"
