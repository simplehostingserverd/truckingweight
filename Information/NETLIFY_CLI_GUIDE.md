# Netlify CLI Deployment Guide for Linux

**CONFIDENTIAL DOCUMENT - FOR INTERNAL USE ONLY**

© 2025 Cargo Scale Pro Inc. All Rights Reserved.
Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer

## Overview

This guide provides step-by-step instructions for deploying the Cargo Scale Pro Inc Weight Management System to Netlify using the Netlify CLI on Linux.

## Prerequisites

- Node.js v21+ installed
- npm v10+ installed
- Git installed
- Netlify account with appropriate permissions

## Installation

1. **Install Netlify CLI globally**

   ```bash
   npm install -g netlify-cli
   ```

2. **Authenticate with Netlify**

   ```bash
   netlify login
   ```

   This will open a browser window where you can authorize the CLI to access your Netlify account.

## Deployment Steps

### 1. Prepare Your Environment File

1. Create a `.env.production` file in the frontend directory:

   ```bash
   cd frontend
   cp .env.example .env.production
   ```

2. Edit the `.env.production` file with your production values:

   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Application URLs
   NEXT_PUBLIC_API_URL=https://your-app-url.netlify.app/api
   NEXT_PUBLIC_APP_URL=https://your-app-url.netlify.app

   # Security Configuration
   NEXT_PUBLIC_LICENSE_KEY=CEG-WMS-2025-XXXX-XXXX
   NEXT_PUBLIC_SECURITY_TOKEN=your-security-token-here
   NEXT_PUBLIC_APP_VERSION=2.0.0
   ```

### 2. Initialize Netlify Site

1. Navigate to your project root:

   ```bash
   cd /home/joker/Pictures/truckingweight
   ```

2. Initialize Netlify site configuration:

   ```bash
   netlify init
   ```

3. Follow the prompts:
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or accept the generated one)
   - Choose your build command: `cd frontend && npm run build`
   - Choose your publish directory: `frontend/.next`

### 3. Configure Environment Variables

1. Add environment variables from your `.env.production` file:

   ```bash
   netlify env:import frontend/.env.production
   ```

   Alternatively, add them manually:

   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://pczfmxigimuluacspxse.supabase.co"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key-here"
   # Add other variables as needed
   ```

### 4. Deploy to Netlify

1. Deploy your site:

   ```bash
   netlify deploy --prod
   ```

2. Wait for the build and deployment to complete. The CLI will provide a URL to your deployed site.

### 5. Set Up Custom Domain (Optional)

1. Add your custom domain:

   ```bash
   netlify domains:add yourdomain.com
   ```

2. Follow the DNS configuration instructions provided by the CLI.

## Continuous Deployment

### Option 1: Deploy from Local Machine

To deploy updates from your local machine:

1. Make your changes
2. Build the application:

   ```bash
   cd frontend
   npm run build
   ```

3. Deploy to Netlify:

   ```bash
   netlify deploy --prod
   ```

### Option 2: Connect to GitHub for Automatic Deployments

1. Connect your GitHub repository:

   ```bash
   netlify sites:create --manual --with-ci
   ```

2. Follow the prompts to connect your GitHub repository.

3. Configure build settings:

   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/.next`

4. Push changes to your repository, and Netlify will automatically deploy them.

## Security Considerations

### Environment Variables

- Never commit `.env.production` to Git
- Use Netlify's environment variable management for sensitive data
- Rotate security tokens periodically

### Netlify.toml Configuration

Create a `netlify.toml` file in your project root with the following content:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "21"
  NPM_VERSION = "10"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://pczfmxigimuluacspxse.supabase.co;"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check the build logs for specific errors
   - Verify that all dependencies are correctly installed
   - Ensure environment variables are properly set

2. **Environment Variable Issues**

   - Verify that all required environment variables are set
   - Check for typos in variable names
   - Ensure values are correctly formatted

3. **Deployment Issues**
   - Run `netlify status` to check your site status
   - Use `netlify logs` to view deployment logs
   - Try `netlify build --dry` to test your build locally

### Support Contacts

For deployment issues, contact:

- Michael Anthony Trevino Jr. - Lead Developer (michael.trevino@cargoscalepro.com)
- IT Support Team (support@cargoscalepro.com)

---

**CONFIDENTIAL DOCUMENT - FOR INTERNAL USE ONLY**

© 2025 Cargo Scale Pro. All Rights Reserved.
Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
