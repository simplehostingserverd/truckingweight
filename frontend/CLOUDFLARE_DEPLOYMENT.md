# Cloudflare Pages Deployment Guide

This guide provides step-by-step instructions for deploying the Simple Scale Solutions application to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (sign up at [cloudflare.com](https://www.cloudflare.com/))
2. Node.js (version 20.x) and npm (version 10.x) installed
3. Wrangler CLI installed globally (`npm install -g wrangler`)

## Deployment Steps

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window where you'll need to log in to your Cloudflare account and authorize Wrangler.

### 2. Build the Application

```bash
cd /home/joker/driving/truckingweight/frontend
npm run build
```

This will create a production build of your Next.js application in the `.next` directory.

### 3. Deploy to Cloudflare Pages

```bash
npm run pages:deploy
```

This will deploy your application to Cloudflare Pages with the project name "simple-scale-solutions". After deployment, your application will be available at `https://simple-scale-solutions.pages.dev`.

### 4. Deploy to a Staging Environment (Optional)

If you want to deploy to a staging environment first:

```bash
npm run pages:deploy:staging
```

This will deploy to a staging branch, which will be available at `https://staging.simple-scale-solutions.pages.dev`.

## Environment Variables

The following environment variables need to be set in the Cloudflare Pages dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: Your hCaptcha site key
- `HCAPTCHA_SECRET_KEY`: Your hCaptcha secret key

To set these variables:

1. Go to the Cloudflare Pages dashboard
2. Select your project (simple-scale-solutions)
3. Go to Settings > Environment variables
4. Add each variable and its value
5. Choose whether to encrypt sensitive variables

## Custom Domains

Once you're ready to move from the temporary subdomain to your custom domain:

1. Go to the Cloudflare Pages dashboard
2. Select your project (simple-scale-solutions)
3. Go to Custom domains
4. Click "Set up a custom domain"
5. Enter your domain name and follow the instructions

## Troubleshooting

### Build Failures

If your build fails, check the build logs in the Cloudflare Pages dashboard for specific errors. Common issues include:

- Missing dependencies
- TypeScript errors
- Environment variable issues

### Runtime Errors

If your application deploys but doesn't work correctly:

1. Check the browser console for errors
2. Verify that all environment variables are set correctly
3. Check that your Supabase and hCaptcha configurations are correct

### hCaptcha Issues

If hCaptcha isn't working on your deployed site:

1. Verify that your site domain is registered with hCaptcha
2. Check that the Content Security Policy allows hCaptcha domains
3. Ensure the hCaptcha site key and secret key are set correctly

## Local Development with Cloudflare Pages

To test your application locally with Cloudflare Pages:

```bash
npm run pages:dev
```

This will start a local development server that simulates the Cloudflare Pages environment.

## CI/CD Integration

For continuous deployment, you can connect your GitHub repository to Cloudflare Pages:

1. Go to the Cloudflare Pages dashboard
2. Click "Create a project"
3. Select "Connect to Git"
4. Choose your repository and configure build settings
5. Set up environment variables
6. Deploy

With this setup, every push to your main branch will trigger a new deployment.

## Monitoring and Analytics

Cloudflare provides built-in analytics for your Pages deployment:

1. Go to the Cloudflare Pages dashboard
2. Select your project
3. Go to Analytics
4. View metrics like requests, bandwidth, and errors
