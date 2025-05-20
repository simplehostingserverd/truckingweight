# Guide for Handling Large Files in the Repository

This guide explains how to handle large files in the TruckingWeight repository to prevent accidentally pushing large amounts of data to GitHub.

## Problem

GitHub has limitations on file sizes and repository sizes. Pushing large files (especially binary files like videos, executables, and libraries) can:

1. Make the repository bloated and slow to clone
2. Exceed GitHub's file size limits (100MB per file)
3. Make git operations slower
4. Consume unnecessary bandwidth

## Solution

We've implemented several safeguards to prevent accidentally pushing large files:

1. **Updated .gitignore**: Large files and directories are now excluded in .gitignore
2. **Pre-push hook**: A git hook that prevents pushing files larger than 10MB
3. **Cleanup script**: A script to remove large files from git tracking without deleting them from the filesystem

## Large Files That Should Not Be Pushed

The following types of files should not be pushed to GitHub:

- **Video files**: .mp4, .webm, .mov, .avi, .mkv, .wmv
- **Cesium assets**: The entire frontend/public/cesium/ directory
- **Binary files**: .exe, .dll, .so, .dylib, .node
- **Node modules**: All node_modules directories
- **License generator**: The entire license-generator/ directory

## How to Handle Large Files

### Option 1: Use External Storage

For large media files like videos, consider:

1. Hosting them on a CDN
2. Using cloud storage (AWS S3, Google Cloud Storage)
3. Using a video hosting service (Vimeo, YouTube)

### Option 2: Use Git LFS (Large File Storage)

For files that must be version-controlled but are large:

1. Install Git LFS: `git lfs install`
2. Track large file types: `git lfs track "*.mp4"`
3. Add the .gitattributes file: `git add .gitattributes`
4. Add and commit your files normally

### Option 3: Keep Locally Only

For files that are only needed for local development:

1. Add them to .gitignore
2. Document how to obtain or generate these files in the README

## Using the Cleanup Script

If you need to remove large files that are already tracked by git:

```bash
# Run the cleanup script
./scripts/remove-large-files.sh

# Push the changes to GitHub
git push origin main
```

This script will:
1. Create a backup of your .git directory
2. Remove large files from git tracking (without deleting them from your filesystem)
3. Commit the changes

## Using the Pre-Push Hook

A pre-push hook has been added to prevent accidentally pushing large files. If you try to push large files, you'll see an error message with instructions on how to fix it.

If you need to bypass the hook for some reason (not recommended), you can use:

```bash
git push --no-verify
```

## Best Practices

1. **Be mindful of file sizes**: Check the size of files before adding them to git
2. **Use appropriate storage**: Use the right tool for the job (git for code, CDNs for media)
3. **Document external dependencies**: If files are stored externally, document how to obtain them
4. **Regularly clean up**: Periodically run the cleanup script to ensure no large files are tracked

## Troubleshooting

If you encounter issues with large files:

1. **Check git status**: Run `git status` to see what files are staged
2. **Check file sizes**: Use `du -h <file>` to check file sizes
3. **Remove from staging**: Use `git reset HEAD <file>` to unstage files
4. **Run the cleanup script**: Use `./scripts/remove-large-files.sh` to clean up

For more help, contact the repository maintainers.
