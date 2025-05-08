#!/bin/bash

# Build the Docker image
echo "Building schema updater Docker image..."
docker build -t schema-updater .

# Run the container with environment variables
echo "Running schema updater..."
docker run -it --rm \
  --env-file .env \
  schema-updater

echo "Schema update process completed."
