# Deployment Guide - Zero Zero App

## Netlify Deployment

### 🔧 Prerequisites

1. **Node.js version**: 18.0.0 or higher
2. **npm version**: 8.0.0 or higher
3. **Vite**: 5.0.0 (installed as dev dependency)

### 📦 Build Dependencies Check

Ensure your `package.json` includes these **essential dependencies**:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2"
  }
}
```

### 🚀 Step-by-Step Deployment

#### 1. **Local Build Test**
```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Preview build
npm run preview
```

#### 2. **Commit & Push to GitHub**
```bash
git add .
git commit -m "Deploy ready - Vite build configured"
git push origin main
```

#### 3. **Netlify Setup**
1. Go to [Netlify](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Build settings should auto-detect from `netlify.toml`

#### 4. **Environment Variables**
In Netlify dashboard → Site settings → Environment variables:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional:**
- `VITE_WATER_API_URL` - Already set to default

#### 5. **Build Configuration**
Netlify will use these settings from `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"
```

### 🐛 Common Build Errors & Solutions

#### **Error: "vite: not found"**
```bash
# Solution: Ensure Vite is in devDependencies
npm install vite --save-dev

# Verify in package.json
"devDependencies": {
  "vite": "^5.0.0"
}
```

#### **Error: "Cannot resolve module"**
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Error: "Build failed with exit code 1"**
```bash
# Solution: Check for TypeScript errors
npm run lint

# Fix any TypeScript issues and rebuild
npm run build
```

#### **Error: "Environment variables not working"**
- Ensure variables are prefixed with `VITE_`
- Check they're set in Netlify dashboard
- Restart deployment after adding variables

### 📊 Performance Optimization

The build includes:
- **Code splitting**: Vendor, UI, and animation chunks
- **Tree shaking**: Removes unused code
- **Minification**: Terser for JavaScript compression
- **Asset optimization**: Images and fonts compressed
- **CDN caching**: Static assets cached for 1 year

### 🔍 Build Debugging

#### **Check Build Logs**
1. Go to Netlify dashboard → Site overview → Production deploys
2. Click on failed deploy
3. Check "Deploy log" for error details

#### **Common Log Errors**
```bash
# Missing dependency
npm ERR! Cannot read properties of undefined

# Solution: Add missing dependency to package.json
npm install missing-package
```

#### **Memory Issues**
```bash
# Error: JavaScript heap out of memory
# Solution: Increase Node.js memory in netlify.toml
[build.environment]
  NODE_OPTIONS = "--max_old_space_size=4096"
```

### 🚦 Deployment Checklist

- [ ] Vite installed as dev dependency
- [ ] Build scripts configured in package.json
- [ ] Environment variables set in Netlify
- [ ] Local build test successful
- [ ] TypeScript compilation passes
- [ ] All imports use correct paths
- [ ] No console errors in production build

### 🔄 Continuous Deployment

Once connected, Netlify will automatically deploy when you push to your main branch:

1. **Push code** → Triggers build
2. **Netlify builds** → Runs `npm run build`
3. **Deploy** → Publishes to CDN
4. **Live site** → Available at your Netlify URL

### 📱 Mobile Testing

Test your deployed app on:
- iOS Safari
- Android Chrome
- Various screen sizes
- Dark/light mode switching

### 🔐 Security Headers

The app includes security headers in `netlify.toml`:
- Content Security Policy
- X-Frame-Options
- X-XSS-Protection
- Referrer Policy

### 🎯 Performance Targets

Your deployed app should achieve:
- **Lighthouse Score**: 90+
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

### 📞 Support

If you encounter issues:
1. Check [Netlify Status](https://www.netlifystatus.com/)
2. Review [Netlify Build Docs](https://docs.netlify.com/configure-builds/overview/)
3. Test local build with `npm run build`
4. Check environment variables are set correctly

---

## Alternative Deployment Options

### Vercel
```bash
npm i -g vercel
vercel
```

### Static Hosting
```bash
npm run build
# Upload dist/ folder to any static hosting
```

Your Zero Zero app is now ready for production! 🚀