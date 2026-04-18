# Deployment Guide

This guide covers deploying the Live Football Scores application to various platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Build for Production](#build-for-production)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

## ✅ Prerequisites

Before deploying, ensure:

- [ ] All tests pass locally
- [ ] No linting errors (`npm run lint`)
- [ ] Environment variables are configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview works correctly (`npm run preview`)

## 🏗️ Build for Production

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Preview the build locally
npm run preview
```

The build output will be in the `dist/` directory.

## 🚀 Deployment Platforms

### Vercel

**Recommended for this project** - Zero configuration deployment.

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables
7. Click "Deploy"

#### Vercel Configuration

The project includes `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Netlify

#### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Option 2: Netlify UI

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables
7. Click "Deploy site"

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages

#### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_PREMIER_LEAGUE_ID: ${{ secrets.VITE_PREMIER_LEAGUE_ID }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

**Update `vite.config.ts`** for GitHub Pages:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
});
```

### Docker

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t live-football-scores .

# Run container
docker run -p 8080:80 live-football-scores
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 🔐 Environment Variables

### Required Variables

```env
VITE_API_BASE_URL=/api/v1/json/3
VITE_PREMIER_LEAGUE_ID=4328
```

### Platform-Specific Setup

**Vercel:**
```bash
vercel env add VITE_API_BASE_URL
vercel env add VITE_PREMIER_LEAGUE_ID
```

**Netlify:**
```bash
netlify env:set VITE_API_BASE_URL "/api/v1/json/3"
netlify env:set VITE_PREMIER_LEAGUE_ID "4328"
```

**GitHub Actions:**
- Go to repository Settings → Secrets and variables → Actions
- Add secrets for each environment variable

## ✅ Post-Deployment

### Verification Checklist

- [ ] Application loads without errors
- [ ] All routes work correctly
- [ ] API calls succeed
- [ ] Live updates are working
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Performance is acceptable

### Performance Optimization

1. **Enable Compression**
   - Vercel/Netlify: Automatic
   - Nginx: Add gzip configuration

2. **Set Cache Headers**
   - Static assets: 1 year
   - HTML: No cache

3. **Monitor Performance**
   - Use Lighthouse
   - Check Core Web Vitals
   - Monitor API response times

### Monitoring

**Recommended Tools:**
- [Vercel Analytics](https://vercel.com/analytics)
- [Google Analytics](https://analytics.google.com)
- [Sentry](https://sentry.io) for error tracking

## 🔄 Continuous Deployment

### Automatic Deployments

Most platforms support automatic deployments:

- **Vercel/Netlify**: Auto-deploy on push to main branch
- **GitHub Pages**: Use GitHub Actions workflow
- **Docker**: Set up CI/CD pipeline

### Branch Deployments

- **Production**: `main` branch
- **Staging**: `develop` branch
- **Preview**: Pull requests

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes Not Working

- Ensure SPA redirect rules are configured
- Check `vercel.json` or `netlify.toml`

### Environment Variables Not Working

- Prefix with `VITE_` for Vite projects
- Rebuild after changing variables
- Check variable names match exactly

### API Calls Failing

- Verify CORS configuration
- Check API base URL
- Ensure environment variables are set

## 📞 Support

For deployment issues:
- Check platform documentation
- Review build logs
- Open an issue in this repository

---

Last Updated: April 18, 2026
