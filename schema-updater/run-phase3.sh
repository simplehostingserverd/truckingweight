#!/bin/bash

# Build the Docker image
echo "Building schema updater Docker image for Phase 3..."
docker build -t schema-updater-phase3 -f Dockerfile.phase3 .

# Run the container with environment variables
echo "Running schema updater for Phase 3..."
docker run -it --rm \
  --env-file .env \
  schema-updater-phase3

echo "Phase 3 schema update process completed."
