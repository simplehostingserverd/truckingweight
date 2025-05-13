#!/bin/bash

# This script helps set up GitHub secrets for the repository
# You'll need to have the GitHub CLI (gh) installed and authenticated

# Repository name
REPO="simplehostingserverd/truckingweight"

# Set up Supabase secrets
echo "Setting up Supabase secrets..."
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://pczfmxigimuluacspxse.supabase.co" --repo $REPO
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w" --repo $REPO
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE" --repo $REPO

# Set up Mapbox secrets
echo "Setting up Mapbox secrets..."
gh secret set NEXT_PUBLIC_MAPBOX_TOKEN --body "pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY2x3MnRqcnRsMDFnMzJrcGR5ZWVxcnRsZSJ9.Ld4-XwYPjH0l1Bj0jh9DuQ" --repo $REPO

# Set up Cesium token (you'll need to get this from your Cesium account)
echo "Setting up Cesium token..."
gh secret set NEXT_PUBLIC_CESIUM_TOKEN --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzZWUtODU5ZS01MWZjZTg4MDE3MmYiLCJpZCI6MjU5MiwiaWF0IjoxNjM2NzQ5NzMxfQ.aP6K-Jc8Tlf-2t9L2Lc0e7wzeJj7jZQ4ohc-5O3KqVk" --repo $REPO

# Set up Docker Hub credentials if needed
echo "Setting up Docker Hub credentials..."
read -p "Enter Docker Hub username: " DOCKER_USERNAME
read -sp "Enter Docker Hub token: " DOCKER_TOKEN
echo ""
gh secret set DOCKER_HUB_USERNAME --body "$DOCKER_USERNAME" --repo $REPO
gh secret set DOCKER_HUB_TOKEN --body "$DOCKER_TOKEN" --repo $REPO

echo "GitHub secrets have been set up successfully!"
