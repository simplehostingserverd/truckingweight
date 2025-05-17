<!--

 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 

-->

# Supabase Authentication Setup Guide

This guide explains how to properly set up Supabase authentication for your application.

## Required Environment Variables

For Supabase authentication to work properly, you need to set up the following environment variables:

### Public Variables (Client-Side)

These variables are exposed to the browser and used for client-side authentication:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)

### Private Variables (Server-Side Only)

These variables are only used on the server and should never be exposed to the client:

- `SUPABASE_JWT_SECRET`: Your Supabase JWT secret
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

## Where to Find These Values

1. **Supabase URL and Anon Key**:

   - Go to your Supabase project dashboard
   - Click on "Settings" in the sidebar
   - Click on "API" in the submenu
   - Under "Project API keys", you'll find:
     - Project URL: Your `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` `public`: Your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **JWT Secret**:

   - Go to your Supabase project dashboard
   - Click on "Settings" in the sidebar
   - Click on "API" in the submenu
   - Click on "JWT Settings"
   - The "JWT Secret" is your `SUPABASE_JWT_SECRET`

3. **Service Role Key**:
   - Go to your Supabase project dashboard
   - Click on "Settings" in the sidebar
   - Click on "API" in the submenu
   - Under "Project API keys", you'll find:
     - `service_role` `secret`: Your `SUPABASE_SERVICE_ROLE_KEY`

## Setting Up Environment Files

1. Copy the `.env.example` file to create a new `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the values in your `.env` file with the actual values from your Supabase project.

3. Make sure these values are consistent across all environments (development, staging, production).

## Important Notes

- The JWT secret is particularly important for authentication to work properly. If it doesn't match what's in your Supabase project settings, authentication will fail.

- The anon key must be the same in all environment files and match what's in your Supabase project.

- Never commit your actual `.env` file to version control. The `.env.example` file should contain placeholder values only.

- The service role key has admin privileges, so keep it secure and only use it for server-side operations that require elevated permissions.

## Troubleshooting

If you're experiencing authentication issues:

1. Verify that your JWT secret matches what's in your Supabase project settings.
2. Check that your anon key is correct and matches what's in your Supabase project.
3. Make sure your Supabase URL is correct.
4. Check the browser console and server logs for any authentication errors.
5. Try visiting `/api/verify-supabase` to check if your Supabase connection is working properly.
