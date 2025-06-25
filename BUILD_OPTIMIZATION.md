# Docker Build Optimization Guide

## Issue
The Docker build is failing with `ENOSPC: no space left on device` errors during the `npm ci` step, indicating insufficient disk space in the build environment.

## Solutions Implemented

### 1. Dockerfile Optimizations
- Added npm configuration optimizations for better retry handling
- Implemented aggressive cache cleanup after each npm install
- Added `--no-audit --no-fund --prefer-offline` flags to reduce network overhead
- Removed unnecessary files and directories after installation
- Cleaned npm test and binary directories to save space

### 2. Build Environment Recommendations

#### For Local Development
```bash
# Clean Docker system before building
docker system prune -af
docker volume prune -f

# Build with increased disk space allocation
docker build --no-cache -t frontend .
```

#### For CI/CD Environments
- Increase disk space allocation for build agents
- Use Docker layer caching when possible
- Consider using a dedicated build server with more storage

#### For Production Deployments
```bash
# Build with memory and disk optimizations
docker build \
  --memory=4g \
  --memory-swap=8g \
  --shm-size=2g \
  -t frontend .
```

### 3. Alternative Solutions

#### Option 1: Use .npmrc for global optimizations
Create a `.npmrc` file in the frontend directory:
```
registry=https://registry.npmjs.org/
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
fetch-retries=3
no-audit=true
no-fund=true
prefer-offline=true
```

#### Option 2: Multi-stage build with dependency caching
Consider implementing a separate dependency installation stage that can be cached.

#### Option 3: Reduce dependencies
Review package.json for unused dependencies that can be removed:
- Heavy packages like Cesium, ArcGIS might be candidates for lazy loading
- Consider using lighter alternatives for UI libraries

### 4. Monitoring

Add build monitoring to track disk usage:
```bash
# Check available space during build
df -h

# Monitor npm cache size
npm cache verify
```

## Next Steps

1. Try building with the optimized Dockerfile
2. If issues persist, increase build environment disk space
3. Consider dependency optimization for long-term solution
4. Implement build monitoring for early detection of space issues