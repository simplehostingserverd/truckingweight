# Cargo Scale Pro Inc - Netlify Deployment Guide

**CONFIDENTIAL DOCUMENT - FOR INTERNAL USE ONLY**

© 2025 Cargo Scale Pro Inc. All Rights Reserved.  
Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Preparing the Application](#preparing-the-application)
4. [Deploying to Netlify](#deploying-to-netlify)
5. [Environment Variables](#environment-variables)
6. [Security Measures](#security-measures)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

## Introduction

This guide provides step-by-step instructions for deploying the Cargo Scale Pro Inc Weight Management System to Netlify. The deployment process includes security measures to protect our proprietary code and intellectual property.

## Prerequisites

Before deploying to Netlify, ensure you have:

- A Netlify account (preferably with team access)
- Access to the GitHub repository
- The necessary environment variables and configuration files
- Admin access to the Supabase project

## Preparing the Application

1. **Build the Application Locally**

   ```bash
   # Install dependencies
   npm run install-deps
   
   # Build the frontend
   cd frontend
   npm run build
   ```

2. **Verify the Build**

   Ensure the build completes successfully without errors. The built files will be in the `frontend/.next` directory.

3. **Prepare Environment Variables**

   Create a `.env.production` file in the frontend directory with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://your-api-url.netlify.app/api
   NEXT_PUBLIC_APP_URL=https://your-app-url.netlify.app
   NEXT_PUBLIC_LICENSE_KEY=your-license-key
   NEXT_PUBLIC_SECURITY_TOKEN=your-security-token
   ```

   **Note:** Replace placeholder values with actual production values.

## Deploying to Netlify

### Method 1: Drag and Drop Deployment

1. **Build for Production**

   ```bash
   cd frontend
   npm run build
   ```

2. **Prepare the Deployment Package**

   - Navigate to the `frontend/.next` directory
   - Create a zip file containing the entire `.next` directory

3. **Deploy to Netlify**

   - Log in to your Netlify account
   - Go to the "Sites" section
   - Drag and drop the zip file onto the Netlify dashboard
   - Wait for the upload and processing to complete

4. **Configure Site Settings**

   - Click on "Site settings"
   - Set a custom domain if needed
   - Configure build settings (not needed for drag and drop)

5. **Add Environment Variables**

   - Go to "Site settings" > "Environment variables"
   - Add all the variables from your `.env.production` file
   - Click "Save" to apply the changes

### Method 2: GitHub Integration (Recommended)

1. **Connect to GitHub**

   - Log in to your Netlify account
   - Click "New site from Git"
   - Select GitHub as the Git provider
   - Authenticate with GitHub
   - Select the repository

2. **Configure Build Settings**

   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

3. **Add Environment Variables**

   - Go to "Site settings" > "Environment variables"
   - Add all the variables from your `.env.production` file
   - Click "Save" to apply the changes

4. **Enable Branch Deploys (Optional)**

   - Go to "Site settings" > "Build & deploy" > "Continuous Deployment"
   - Configure branch deploy settings as needed

## Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | https://pczfmxigimuluacspxse.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| NEXT_PUBLIC_API_URL | API endpoint URL | https://your-api-url.netlify.app/api |
| NEXT_PUBLIC_APP_URL | Application URL | https://your-app-url.netlify.app |
| NEXT_PUBLIC_LICENSE_KEY | License validation key | CEG-WMS-2025-XXXX-XXXX |
| NEXT_PUBLIC_SECURITY_TOKEN | Security token for API calls | t0k3n-v4lu3-h3r3 |

### How to Add Environment Variables

1. **Using the Netlify UI**

   - Go to "Site settings" > "Environment variables"
   - Click "Add variable"
   - Enter the key and value
   - Click "Save"

2. **Using the netlify.toml File**

   Create a `netlify.toml` file in the root directory:

   ```toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "21"
     NPM_VERSION = "10"
   ```

3. **Using .env Files**

   - Create a `.env` file in the frontend directory
   - Add it to the `.gitignore` file to prevent committing sensitive information
   - Manually upload the file to Netlify using the UI

## Security Measures

### Code Protection

1. **License Verification System**

   The application includes a license verification system that validates the deployment against our license server. If the license is invalid or expired, the application will not function correctly.

   ```javascript
   // Implementation in frontend/src/utils/license-verification.js
   export async function verifyLicense() {
     const licenseKey = process.env.NEXT_PUBLIC_LICENSE_KEY;
     const securityToken = process.env.NEXT_PUBLIC_SECURITY_TOKEN;
     
     // Verify license with our server
     const response = await fetch('https://license.cosmoexploitgroup.com/verify', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${securityToken}`
       },
       body: JSON.stringify({ licenseKey })
     });
     
     if (!response.ok) {
       // Implement kill switch if license is invalid
       activateKillSwitch();
       return false;
     }
     
     return true;
   }
   ```

2. **Kill Switch Implementation**

   The application includes a kill switch that can be activated remotely if unauthorized use is detected.

   ```javascript
   // Implementation in frontend/src/utils/security.js
   export function activateKillSwitch() {
     // Clear local storage
     localStorage.clear();
     
     // Disable functionality
     window.__appDisabled = true;
     
     // Redirect to error page
     window.location.href = '/license-error';
     
     // Report unauthorized use
     reportUnauthorizedUse();
   }
   ```

3. **Code Obfuscation**

   All critical JavaScript files are obfuscated during the build process to make reverse engineering more difficult.

4. **API Request Signing**

   All API requests include a signature generated using a secret key to prevent unauthorized API access.

### Deployment Security

1. **Netlify Access Control**

   - Enable two-factor authentication for all team members
   - Restrict access to the Netlify site to authorized team members only
   - Use Netlify Identity for access control

2. **Environment Variable Encryption**

   All sensitive environment variables are encrypted by Netlify and only decrypted during build and runtime.

3. **Custom Headers**

   Add security headers by creating a `_headers` file in the `public` directory:

   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: camera=(), microphone=(), geolocation=()
     Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://pczfmxigimuluacspxse.supabase.co;
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

3. **API Connection Problems**

   - Verify that the API URL is correct
   - Check CORS settings
   - Ensure the API is accessible from the Netlify domain

### Support Contacts

For deployment issues, contact:

- Michael Anthony Trevino Jr. - Lead Developer (michael.trevino@cosmoexploitgroup.com)
- IT Support Team (support@cosmoexploitgroup.com)

## Maintenance

### Regular Updates

1. **Updating the Application**

   - Push changes to the GitHub repository
   - Netlify will automatically rebuild and deploy the site

2. **Monitoring**

   - Use Netlify Analytics to monitor site traffic
   - Set up alerts for unusual activity
   - Regularly check the application logs

### Security Audits

Perform regular security audits to ensure the application remains secure:

1. **License Verification**

   - Verify that the license system is functioning correctly
   - Update license keys as needed

2. **Dependency Updates**

   - Regularly update dependencies to patch security vulnerabilities
   - Test thoroughly after updates

---

**CONFIDENTIAL DOCUMENT - FOR INTERNAL USE ONLY**

© 2025 Cargo Scale Pro Inc. All Rights Reserved.  
Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
