# Deployment Guide for Simple Scale Solutions

This guide provides instructions for deploying the Simple Scale Solutions application with hCaptcha integration on temporary subdomains.

## Prerequisites

1. A hCaptcha account (sign up at [hcaptcha.com](https://www.hcaptcha.com/))
2. An account with a cloud provider that offers temporary subdomains (Vercel, Netlify, etc.)
3. Access to the application's source code

## Setting Up hCaptcha for Temporary Subdomains

### Step 1: Register Your Site with hCaptcha

1. Log in to your hCaptcha account at [dashboard.hcaptcha.com](https://dashboard.hcaptcha.com/)
2. Click on "New Site"
3. Enter a name for your site (e.g., "Simple Scale Solutions Staging")
4. For the domain, you have two options:
   - If you know the temporary subdomain pattern your provider uses (e.g., `*.vercel.app` or `*.netlify.app`), enter that
   - If you don't know the exact subdomain yet, you can use a wildcard domain like `*.vercel.app` and update it later
5. Set the difficulty level (recommended: "Easy" for testing, "Moderate" for production)
6. Click "Save"

### Step 2: Get Your hCaptcha Keys

After registering your site, you'll receive:

- A **Site Key** (public, used in the frontend)
- A **Secret Key** (private, used in the backend)

### Step 3: Configure Environment Variables

#### For Local Development

Create or update your `.env.local` file with:

```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key
HCAPTCHA_SECRET_KEY=your_secret_key
```

#### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add the following variables:
   - `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: Your hCaptcha site key
   - `HCAPTCHA_SECRET_KEY`: Your hCaptcha secret key
4. Deploy your application

#### For Netlify Deployment

1. Go to your Netlify site settings
2. Navigate to "Build & deploy" > "Environment"
3. Add the following variables:
   - `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: Your hCaptcha site key
   - `HCAPTCHA_SECRET_KEY`: Your hCaptcha secret key
4. Deploy your application

## Deployment Steps

### Deploying to Vercel

1. Install the Vercel CLI: `npm install -g vercel`
2. Log in to Vercel: `vercel login`
3. Deploy the application: `vercel`
4. Follow the prompts to configure your project
5. Once deployed, you'll receive a temporary subdomain (e.g., `your-project.vercel.app`)
6. Update your hCaptcha site configuration with this domain if necessary

### Deploying to Netlify

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Log in to Netlify: `netlify login`
3. Initialize your site: `netlify init`
4. Deploy the application: `netlify deploy --prod`
5. Once deployed, you'll receive a temporary subdomain (e.g., `your-project.netlify.app`)
6. Update your hCaptcha site configuration with this domain if necessary

## Testing hCaptcha on Your Deployed Site

1. Visit your deployed site's login page
2. Verify that the hCaptcha widget appears
3. Complete the captcha challenge
4. Attempt to log in with valid credentials
5. Check the server logs to ensure the captcha verification is working correctly

## Troubleshooting

### hCaptcha Widget Not Appearing

- Check that your site key is correctly set in the environment variables
- Verify that the Content Security Policy allows hCaptcha domains
- Check the browser console for any errors

### Captcha Verification Failing

- Ensure your secret key is correctly set in the environment variables
- Check that your domain is properly registered with hCaptcha
- Verify that the API endpoint for verification is correctly implemented

### Domain Mismatch Issues

If you're getting domain mismatch errors:

1. Go to your hCaptcha dashboard
2. Update your site configuration with the actual temporary domain
3. Wait a few minutes for the changes to propagate
4. Try again

## Moving to a Permanent Domain

When you're ready to move to a permanent domain:

1. Update your hCaptcha site configuration with your new domain
2. Update your environment variables if necessary
3. Deploy to your permanent domain
4. Test to ensure everything works correctly

## Security Considerations

- Never expose your hCaptcha secret key in client-side code
- Implement proper rate limiting on your login API
- Consider adding additional security measures like IP-based rate limiting
- Regularly review your hCaptcha analytics to detect unusual patterns
