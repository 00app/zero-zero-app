# Deployment Guide

## Netlify Deployment

### 1. Prerequisites

- GitHub account with your code repository
- Netlify account (free tier available)
- Environment variables ready

### 2. Build Setup

Ensure your `package.json` has the correct build script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. Netlify Configuration

The `netlify.toml` file is already configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### 4. Environment Variables

In your Netlify dashboard, add these environment variables:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional:**
- `VITE_WATER_API_URL` - Water quality API endpoint (already set to default)

### 5. Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy ready"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Build settings should auto-detect from `netlify.toml`

3. **Set Environment Variables**
   - In Netlify dashboard → Site settings → Environment variables
   - Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Visit your live site URL

### 6. Custom Domain (Optional)

1. In Netlify dashboard → Domain management
2. Add custom domain
3. Configure DNS settings with your domain provider
4. Enable HTTPS (automatic with Netlify)

### 7. Continuous Deployment

Once connected, Netlify will automatically deploy when you push to your main branch.

## Alternative Deployment Options

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy

### Static Hosting

1. Build: `npm run build`
2. Upload `dist/` folder to any static hosting service
3. Configure redirects for SPA routing

## Build Troubleshooting

### Common Issues

1. **Build fails with "vite: not found"**
   - Ensure `vite` is in `devDependencies`
   - Run `npm install` to install dependencies

2. **Environment variables not working**
   - Ensure they're prefixed with `VITE_`
   - Check they're set in Netlify dashboard

3. **404 errors on refresh**
   - Ensure `_redirects` file or `netlify.toml` has SPA redirect rules

### Performance Optimization

The build includes:
- Code splitting
- Tree shaking
- Asset optimization
- Gzip compression
- CDN caching headers

Your site should achieve:
- Lighthouse score: 90+
- First Contentful Paint: <2s
- Time to Interactive: <3s