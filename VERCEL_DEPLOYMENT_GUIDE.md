# Deployment Guide for Vercel

This guide explains how to deploy the Evolution of Todo frontend to Vercel.

## Prerequisites

- A Vercel account (sign up at <https://vercel.com>)
- Vercel CLI installed: `npm install -g vercel`
- Git repository initialized and connected to Vercel

## Deployment Steps

### 1. Prepare the Frontend for Deployment

Make sure your `frontend` directory has the following files:

- `package.json` with build scripts
- `vercel.json` configuration file
- `next.config.js` for Next.js configuration

### 2. Set Up Environment Variables

Before deploying, you need to configure the following environment variables in your Vercel project:

#### Build-time Environment Variables

- `NEXT_PUBLIC_API_URL`: The URL of your backend API (e.g., `https://your-backend-api.com`)
- `NEXT_PUBLIC_AGENT_API_URL`: The URL of your AI agent API (e.g., `https://your-agent-api.com`)

#### How to set environment variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the variables listed above

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Navigate to the frontend directory
cd frontend

# Login to Vercel (if not already logged in)
vercel login

# Deploy to production
vercel --prod
```

#### Option B: Using Git Integration

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project in the Vercel dashboard
3. Vercel will automatically deploy when you push to the main branch

### 4. Configure Project Settings in Vercel Dashboard

#### Build & Development Settings

- Framework Preset: `Next.js`
- Build Command: `npm run build` (should be auto-detected)
- Install Command: `npm install` (should be auto-detected)
- Output Directory: `out` (for Next.js static exports) or leave blank for server-side apps

#### Root Directory

- Set to `frontend` if deploying from a monorepo

### 5. Post-Deployment Configuration

#### Custom Domains (Optional)

1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

#### Analytics (Optional)

- Vercel Analytics can be enabled in the project settings
- Provides insights on page views, performance, and user behavior

### 6. Environment-Specific Deployments

#### Preview Deployments

- Every pull request to your Git repository will automatically generate a preview deployment
- These deployments have unique URLs for testing

#### Production Deployment

- Changes to the main branch (or your configured production branch) will trigger a production deployment
- Alternatively, use `vercel --prod` to force a production deployment

### 7. Troubleshooting

#### Common Issues

1. **Build Failures**:
   - Ensure all dependencies are listed in `package.json`
   - Check that environment variables are properly configured
   - Verify that the build command matches your `package.json` scripts

2. **Environment Variables Not Working**:
   - Make sure variables are prefixed with `NEXT_PUBLIC_` for client-side access
   - Verify variables are set for the correct environment (preview vs production)

3. **API Calls Failing**:
   - Confirm that `NEXT_PUBLIC_API_URL` points to the correct backend
   - Check that the backend is accessible from the deployed frontend

#### Useful Commands

```bash
# Check deployment status
vercel status

# List all deployments
vercel ls

# Inspect a specific deployment
vercel inspect [deployment-id]

# Pull environment variables locally (for development)
vercel env pull .env.local
```

### 8. Monitoring and Logs

#### Accessing Logs

1. Go to your project in the Vercel dashboard
2. Select a specific deployment
3. Click on "Logs" to view server logs

#### Performance Monitoring

- Vercel provides built-in performance metrics
- Access Core Web Vitals and other performance data in the dashboard

### 9. Rollbacks

If you need to rollback to a previous deployment:

1. Go to your project deployments in the Vercel dashboard
2. Find the working deployment
3. Click "Promote" to make it the production deployment

### 10. Continuous Integration

For automated deployments:

1. Connect your Git repository to Vercel
2. Configure the branch settings for automatic deployments
3. Set up build hooks if needed for external triggers

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
