# Serverless Deployment Guide

This guide explains how to deploy the WordPress Site Analyzer with PDF generation support on serverless platforms like Vercel.

## Overview

The application now supports environment-aware PDF generation that automatically adapts to different deployment environments:

- **Local Development**: Uses standard `puppeteer` with local Chromium
- **Vercel/Serverless**: Uses `puppeteer-core` with self-hosted Chromium from GitHub CDN

## Features

- ✅ **Automatic Environment Detection**: No manual configuration needed
- ✅ **Bundle Size Optimization**: Keeps Vercel function under 50MB limit
- ✅ **Self-Hosted Chromium**: Uses GitHub CDN (free, no bandwidth costs)
- ✅ **Backward Compatibility**: Maintains local development experience
- ✅ **Performance Optimized**: Different configurations for different environments

## Deployment on Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Configure SMTP and API keys

### Step 1: Deploy to Vercel

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from your project directory
   vercel
   ```

2. **Or use Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

### Step 2: Configure Environment Variables

In your Vercel dashboard, go to Project Settings → Environment Variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=WordPress Analyzer <your-email@gmail.com>

# PageSpeed Insights API
PSI_API_KEY=your-pagespeed-insights-api-key

# Deployment Environment (automatically set by Vercel)
VERCEL=1
NODE_ENV=production
```

### Step 3: Deploy

Vercel will automatically:
- Install dependencies (`puppeteer-core` + `@sparticuz/chromium-min`)
- Build the application
- Deploy with optimized serverless configuration

## How It Works

### Environment Detection

The application automatically detects the deployment environment:

```javascript
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';
const isServerless = isVercel || isProduction;
```

### Browser Launch Strategy

#### Local Development
```javascript
// Uses standard puppeteer with local Chromium
const puppeteer = require('puppeteer');
browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', ...],
    timeout: 120000
});
```

#### Vercel/Serverless
```javascript
// Uses puppeteer-core with self-hosted Chromium
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium-min');

browser = await puppeteer.launch({
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'
    ),
    headless: chromium.headless,
    timeout: 30000 // Reduced for serverless
});
```

### Performance Optimizations

#### Serverless Environment
- **Reduced Timeouts**: 30 seconds instead of 120 seconds
- **Single Process**: `--single-process` flag for memory efficiency
- **Optimized PDF Scale**: 0.8x scale to reduce memory usage
- **CSS Page Size**: `preferCSSPageSize: true` for better rendering

#### Local Environment
- **Full Timeouts**: 120 seconds for complex reports
- **Standard PDF Scale**: 1.0x for maximum quality
- **CSS Page Size**: `preferCSSPageSize: false` for compatibility

## Testing

### Local Testing

```bash
# Test with local configuration
npm run test-pdf

# Test PDF generation specifically
npm run test-pdf-direct
```

### Serverless Testing

```bash
# Test with serverless configuration
npm run test-pdf-serverless

# Test on deployed Vercel instance
curl -X POST https://your-app.vercel.app/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://wordpress.org"}' \
  --output test-report.pdf
```

## Troubleshooting

### Common Issues

#### 1. Bundle Size Exceeded
```
Error: The Serverless Function exceeds the maximum size limit of 50mb
```
**Solution**: Ensure you're using `puppeteer-core` + `@sparticuz/chromium-min` (already configured)

#### 2. Chromium Download Failed
```
Error: Failed to download Chromium
```
**Solution**: Check network connectivity and GitHub CDN availability

#### 3. Timeout Issues
```
Error: Function execution timed out
```
**Solution**: Reduce PDF complexity or increase Vercel function timeout

#### 4. Memory Issues
```
Error: Function exceeded maximum memory limit
```
**Solution**: Use serverless optimizations (already configured)

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=puppeteer:*
NODE_ENV=development
```

### Environment Info

The application logs environment information when PDF generation fails:

```javascript
console.error('Environment info:', PuppeteerConfig.getEnvironmentInfo());
```

## Performance Considerations

### Bundle Size
- **Standard Puppeteer**: ~150MB (exceeds Vercel limit)
- **Optimized Setup**: ~15MB (well under limit)

### Memory Usage
- **Local**: Up to 500MB for complex PDFs
- **Serverless**: Optimized to ~200MB maximum

### Cold Start Time
- **First Request**: ~3-5 seconds (Chromium download)
- **Subsequent Requests**: ~1-2 seconds

### Chromium Hosting
- **Source**: GitHub CDN (free)
- **Bandwidth**: No cost to your Vercel account
- **Updates**: Manual version updates in configuration

## Security Considerations

### Self-Hosted Chromium
- **Source**: Official Chromium builds from GitHub
- **Version**: Pinned to specific version (v131.0.0)
- **Security**: Regular updates available

### Environment Variables
- **SMTP Credentials**: Use App Passwords for Gmail
- **API Keys**: Store securely in Vercel dashboard
- **No Hardcoded Secrets**: All sensitive data in environment variables

## Monitoring

### Vercel Analytics
- Monitor function execution time
- Track memory usage
- Identify performance bottlenecks

### Application Logs
- Environment detection logs
- PDF generation success/failure
- Performance metrics

## Updates

### Chromium Version Updates
1. Check for new releases: [@sparticuz/chromium](https://github.com/Sparticuz/chromium/releases)
2. Update version in `src/utils/puppeteer-config.js`
3. Test locally with `npm run test-pdf-serverless`
4. Deploy to Vercel

### Package Updates
```bash
# Update serverless packages
npm update puppeteer-core @sparticuz/chromium-min

# Test before deploying
npm run test-pdf-serverless
```

## Support

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Puppeteer Documentation](https://pptr.dev/)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)

### Common Patterns
- [Serverless Puppeteer Examples](https://github.com/Sparticuz/chromium#examples)
- [Vercel Function Examples](https://vercel.com/docs/functions/serverless-functions)
